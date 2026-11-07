"""Faz 5 webhook dispatcher: sonuc-hazir -> HMAC imzali, icerik-tasimayan callback;
retry/backoff; basarisizlikta FAILED. Imza SDK verify ile dogrulanir."""

import json

import pytest
from fastapi.testclient import TestClient

from api.app import app
from api.auth import reload_tokens
from config.settings import settings
from orchestrator import db, webhook
from orchestrator.dispatch import InMemoryDispatcher, set_dispatcher
from orchestrator.models import WebhookDelivery
from platform_core import bootstrap, signing, tenants
from platform_core.bootstrap import DEV_TENANT
from tests.synthetic import pdf as synthetic_pdf
from workers import light

SECRET = "top-secret-webhook-key"
HOOK_URL = "https://consumer.example/hooks/media"


@pytest.fixture
def ctx():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(InMemoryDispatcher())
    token = next(iter(reload_tokens()["tenants"]))
    tenants._config = {DEV_TENANT: {"webhook_url": HOOK_URL, "webhook_secret": SECRET}}
    yield TestClient(app), token
    tenants.reload()


def _submit_and_process(client, token):
    submit = client.post(
        "/v1/assets",
        content=synthetic_pdf(),
        headers={
            "Authorization": f"Bearer {token}",
            "X-Document-Type": "STUDENT",
            "Content-Type": "application/octet-stream",
        },
    )
    assert submit.status_code == 202, submit.text
    light.run_until_idle()
    return submit.json()


def test_completed_job_delivers_signed_contentless_webhook(ctx):
    client, token = ctx
    ids = _submit_and_process(client, token)

    calls = []

    def transport(url, body, headers, timeout):
        calls.append((url, body, headers))
        return 200

    stats = webhook.dispatch_pending(transport=transport)
    assert stats["delivered"] == 1

    url, body, headers = calls[0]
    assert url == HOOK_URL
    # Imza dogrulanmali (SDK tarafindaki verify ile ayni).
    assert signing.verify(SECRET, body, headers[signing.SIGNATURE_HEADER])
    payload = json.loads(body)
    assert payload["event"] == "job.completed"
    assert payload["asset_id"] == ids["asset_id"]
    # Icerik/PII tasimamali: yalniz referanslar.
    assert set(payload) == {"event", "asset_id", "job_id", "tenant_id", "occurred_at"}

    # Teslim edildi -> ikinci dispatch bir sey gondermez.
    assert webhook.dispatch_pending(transport=transport)["delivered"] == 0


def test_no_webhook_when_url_unconfigured(ctx):
    client, token = ctx
    tenants._config = {DEV_TENANT: {"webhook_url": "", "webhook_secret": SECRET}}
    _submit_and_process(client, token)
    with db.session() as sess:
        assert sess.query(WebhookDelivery).count() == 0


def test_retry_then_fail_after_max_attempts(ctx):
    client, token = ctx
    _submit_and_process(client, token)

    original_max = settings.WEBHOOK_MAX_ATTEMPTS
    original_backoff = settings.WEBHOOK_BACKOFF_SECONDS
    settings.WEBHOOK_MAX_ATTEMPTS = 2
    settings.WEBHOOK_BACKOFF_SECONDS = 0  # next_attempt hemen tekrar uygun
    try:
        def failing(url, body, headers, timeout):
            return 500

        first = webhook.dispatch_pending(transport=failing)
        assert first["retried"] == 1 and first["delivered"] == 0
        second = webhook.dispatch_pending(transport=failing)
        assert second["failed"] == 1
    finally:
        settings.WEBHOOK_MAX_ATTEMPTS = original_max
        settings.WEBHOOK_BACKOFF_SECONDS = original_backoff

    with db.session() as sess:
        row = sess.query(WebhookDelivery).one()
        assert row.status == "FAILED"
        assert row.attempts == 2


def test_transport_exception_is_retried(ctx):
    client, token = ctx
    _submit_and_process(client, token)

    def boom(url, body, headers, timeout):
        raise RuntimeError("connection refused")

    stats = webhook.dispatch_pending(transport=boom)
    assert stats["retried"] == 1
    with db.session() as sess:
        row = sess.query(WebhookDelivery).one()
        assert row.status == "PENDING"
        assert "connection refused" in row.last_error
