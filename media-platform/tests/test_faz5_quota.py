"""Faz 5 multi-tenant kota: eszamanlilik + gunluk hacim tavani.

Kota tenant_config'ten gelir; burada dusuk degerlerle zorlanir. Asilinca public
submit 429 QUOTA_EXCEEDED doner. Eszamanlilik in-flight asset'lere, gunluk hacim
UsageLog(SUBMITTED) sayisina bakar.
"""

import pytest
from fastapi.testclient import TestClient

from api.app import app
from api.auth import reload_tokens
from orchestrator import db
from orchestrator.dispatch import InMemoryDispatcher, set_dispatcher
from platform_core import bootstrap, tenants
from platform_core.bootstrap import DEV_TENANT
from tests.synthetic import pdf as synthetic_pdf
from workers import light


@pytest.fixture
def ctx():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(InMemoryDispatcher())
    token = next(iter(reload_tokens()["tenants"]))
    yield TestClient(app), token
    tenants.reload()


def _set_quota(concurrency, daily):
    tenants._config = {DEV_TENANT: {"concurrency": concurrency, "daily": daily}}


def _submit(client, token):
    return client.post(
        "/v1/assets",
        content=synthetic_pdf(),
        headers={
            "Authorization": f"Bearer {token}",
            "X-Document-Type": "STUDENT",
            "Content-Type": "application/octet-stream",
        },
    )


def test_concurrency_cap_blocks_then_recovers(ctx):
    client, token = ctx
    _set_quota(concurrency=2, daily=100)

    assert _submit(client, token).status_code == 202
    assert _submit(client, token).status_code == 202
    # Iki in-flight asset -> ucuncu eszamanlilik tavanini asar.
    blocked = _submit(client, token)
    assert blocked.status_code == 429
    assert blocked.json()["code"] == "QUOTA_EXCEEDED"

    # In-flight'lar bitince eszamanlilik serbest kalir.
    light.run_until_idle()
    assert _submit(client, token).status_code == 202


def test_daily_volume_cap_blocks_even_when_idle(ctx):
    client, token = ctx
    _set_quota(concurrency=100, daily=2)

    assert _submit(client, token).status_code == 202
    light.run_until_idle()
    assert _submit(client, token).status_code == 202
    light.run_until_idle()
    # Hic in-flight yok ama gunluk hacim doldu.
    blocked = _submit(client, token)
    assert blocked.status_code == 429
    assert blocked.json()["code"] == "QUOTA_EXCEEDED"
