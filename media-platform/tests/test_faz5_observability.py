"""Faz 5 observability: metrik anlik gorntusu + autoscale sinyali.

Autoscale: GPU tier'lari (ocr/asr) backlog sifir olsa da hot-floor=1; backlog
arttikca kaynak-sinifi basina worker sayisi batch'e gore buyur. /internal/metrics
yalniz dispatcher rolune acik."""

import pytest
from fastapi.testclient import TestClient

from api.app import app
from api.auth import reload_tokens
from orchestrator import db, metrics
from orchestrator.dispatch import InMemoryDispatcher, set_dispatcher
from platform_core import bootstrap
from tests.synthetic import pdf as synthetic_pdf
from workers import light


@pytest.fixture
def ctx():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(InMemoryDispatcher())
    tokens = reload_tokens()
    tenant_token = next(iter(tokens["tenants"]))
    return TestClient(app), tenant_token, tokens["roles"]["dispatcher"]


def test_autoscale_hot_floor_and_scaling():
    plan = metrics.autoscale_plan({})
    # GPU tier'lari sifira inmez.
    assert plan["ocr"] == 1 and plan["asr"] == 1
    # Ucuz siniflar backlog yoksa sifir.
    assert plan["evaluation"] == 0

    scaled = metrics.autoscale_plan({"asr": 10, "evaluation": 3})
    assert scaled["asr"] == 3  # ceil(10/4)
    assert scaled["evaluation"] == 1  # ceil(3/4)


def test_snapshot_reflects_processed_work(ctx):
    client, tenant_token, dispatcher_token = ctx
    client.post(
        "/v1/assets",
        content=synthetic_pdf(),
        headers={
            "Authorization": f"Bearer {tenant_token}",
            "X-Document-Type": "STUDENT",
            "Content-Type": "application/octet-stream",
        },
    )
    light.run_until_idle()

    snap = metrics.snapshot()
    assert snap["assets_by_status"].get("COMPLETED") == 1
    assert snap["jobs_by_status"].get("COMPLETED", 0) >= 1
    assert snap["usage_by_event"].get("SUBMITTED") == 1
    assert snap["usage_by_event"].get("COMPLETED") == 1
    assert snap["sealed_results"] == 1
    assert snap["autoscale"]["asr"] == 1  # hot-floor her zaman
    assert snap["queue_depth"] == 0


def test_metrics_endpoint_requires_dispatcher_role(ctx):
    client, tenant_token, dispatcher_token = ctx
    # Tenant token'i internal uca erisemez.
    assert client.get("/internal/metrics", headers={"Authorization": f"Bearer {tenant_token}"}).status_code == 403
    ok = client.get("/internal/metrics", headers={"Authorization": f"Bearer {dispatcher_token}"})
    assert ok.status_code == 200
    assert "autoscale" in ok.json()
