"""Faz 5 Python SDK: TestClient'i transport olarak enjekte edip submit/status/
result/cancel + webhook imza dogrulamayi uctan uca test eder."""

import json

import pytest
from fastapi.testclient import TestClient

from api.app import app
from api.auth import reload_tokens
from media_platform_sdk import Client, MediaPlatformError, verify_webhook
from orchestrator import db, webhook
from orchestrator.dispatch import InMemoryDispatcher, set_dispatcher
from platform_core import bootstrap, tenants
from platform_core.bootstrap import DEV_TENANT
from workers import light

SECRET = "sdk-webhook-secret"
HOOK_URL = "https://consumer.example/hook"


@pytest.fixture
def client():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(InMemoryDispatcher())
    token = next(iter(reload_tokens()["tenants"]))
    sdk = Client(token=token, http_client=TestClient(app))
    yield sdk
    tenants.reload()


def test_document_roundtrip_via_sdk(client):
    from tests.synthetic import pdf as synthetic_pdf

    submitted = client.submit(synthetic_pdf(), document_type="STUDENT")
    assert "job_id" in submitted and "asset_id" in submitted
    job_id = submitted["job_id"]

    light.run_until_idle()

    assert client.status(job_id)["status"] == "COMPLETED"
    result = client.result(job_id)
    assert result["student_status"] == "ACTIVE"

    # delete-on-delivery: ikinci cekis NOT_FOUND.
    with pytest.raises(MediaPlatformError) as exc:
        client.result(job_id)
    assert exc.value.status_code == 404


def test_quota_error_surfaces_code(client):
    from tests.synthetic import pdf as synthetic_pdf

    tenants._config = {DEV_TENANT: {"concurrency": 1, "daily": 100}}
    client.submit(synthetic_pdf(), document_type="STUDENT")
    with pytest.raises(MediaPlatformError) as exc:
        client.submit(synthetic_pdf(), document_type="STUDENT")
    assert exc.value.status_code == 429
    assert exc.value.code == "QUOTA_EXCEEDED"


def test_sdk_verifies_webhook_signature(client):
    from tests.synthetic import pdf as synthetic_pdf

    tenants._config = {DEV_TENANT: {"webhook_url": HOOK_URL, "webhook_secret": SECRET}}
    client.submit(synthetic_pdf(), document_type="STUDENT")
    light.run_until_idle()

    captured = {}

    def transport(url, body, headers, timeout):
        captured["body"] = body
        captured["sig"] = headers["X-Media-Signature"]
        return 200

    webhook.dispatch_pending(transport=transport)
    assert verify_webhook(SECRET, captured["body"], captured["sig"]) is True
    assert verify_webhook("wrong-secret", captured["body"], captured["sig"]) is False
    assert json.loads(captured["body"])["event"] == "job.completed"
