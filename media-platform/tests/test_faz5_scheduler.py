"""Faz 5 tenant-fair scheduler: SWRR ile tenant'lar agirliga gore serpistirilir;
tek tenant'in patlamasi digerini ac birakmaz. Ayrica tam belge pipeline'i bu
dispatcher ile uctan uca kosar."""

import pytest
from fastapi.testclient import TestClient

from api.app import app
from api.auth import reload_tokens
from orchestrator import db
from orchestrator.contracts import JobMessage
from orchestrator.dispatch import TenantFairDispatcher, set_dispatcher
from platform_core import bootstrap, tenants
from tests.synthetic import pdf as synthetic_pdf
from workers import light

TENANT_A = "00000000-0000-0000-0000-00000000000a"
TENANT_B = "00000000-0000-0000-0000-00000000000b"


def _msg(tenant, n):
    # Gecerli JobMessage; fairness icin yalniz tenant_id onemli.
    uid = f"00000000-0000-0000-0000-{n:012d}"
    return JobMessage(
        schema_version=1,
        asset_id=uid,
        job_id=uid,
        operation="INGEST",
        correlation_id=uid,
        tenant_id=tenant,
    ).to_dict()


def _drain_tenants(dispatcher, limit):
    order = []
    for _ in range(limit):
        message = dispatcher.pop()
        if message is None:
            break
        order.append(message["tenant_id"])
    return order


def test_burst_tenant_does_not_starve_other():
    tenants._config = {TENANT_A: {"weight": 1}, TENANT_B: {"weight": 1}}
    try:
        disp = TenantFairDispatcher()
        for i in range(3):
            disp.publish(_msg(TENANT_A, i))
        disp.publish(_msg(TENANT_B, 99))
        order = _drain_tenants(disp, 10)
    finally:
        tenants.reload()
    # B, A'nin 3 mesajinin arkasina dusmez; esit agirlikta ikinci sirada servis edilir.
    assert order[1] == TENANT_B
    assert order.count(TENANT_A) == 3 and order.count(TENANT_B) == 1


def test_weighted_share_is_proportional():
    tenants._config = {TENANT_A: {"weight": 3}, TENANT_B: {"weight": 1}}
    try:
        disp = TenantFairDispatcher()
        for i in range(100):
            disp.publish(_msg(TENANT_A, i))
        for i in range(100):
            disp.publish(_msg(TENANT_B, 1000 + i))
        order = _drain_tenants(disp, 40)
    finally:
        tenants.reload()
    a, b = order.count(TENANT_A), order.count(TENANT_B)
    # 3:1 agirlik -> yaklasik %75 / %25 (serpistirme smooth).
    assert a == 30 and b == 10


@pytest.fixture
def ctx():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(TenantFairDispatcher())
    token = next(iter(reload_tokens()["tenants"]))
    return TestClient(app), token


def test_document_pipeline_runs_under_fair_dispatcher(ctx):
    client, token = ctx
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
    job_id = submit.json()["job_id"]
    light.run_until_idle()
    status = client.get(f"/v1/jobs/{job_id}", headers={"Authorization": f"Bearer {token}"})
    assert status.json()["status"] == "COMPLETED"
