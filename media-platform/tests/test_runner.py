"""Calistirma dongusu: arka plan worker submit edilen job'u isler; bakim adimi
hata vermeden calisir (docker API konteyneri + standalone worker yolu)."""

import time

import pytest

from api.auth import reload_tokens
from orchestrator import db, engine
from orchestrator.dispatch import InMemoryDispatcher, set_dispatcher
from platform_core import bootstrap
from platform_core.bootstrap import DEV_TENANT
from tests.synthetic import pdf as synthetic_pdf
from workers import runner


@pytest.fixture
def ctx():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(InMemoryDispatcher())
    reload_tokens()
    yield
    runner.stop_background()


def test_background_worker_processes_submission(ctx):
    submitted = engine.submit(DEV_TENANT, "STUDENT", synthetic_pdf(), profile="document")
    job_id = submitted["job_id"]

    runner.start_background()
    deadline = time.monotonic() + 10
    status = None
    while time.monotonic() < deadline:
        status = engine.job_status(DEV_TENANT, job_id)["status"]
        if status in ("COMPLETED", "FAILED"):
            break
        time.sleep(0.05)
    runner.stop_background()

    assert status == "COMPLETED"


def test_maintenance_runs_clean(ctx):
    # Bos sistemde bile reconcile + webhook + retention hatasiz donmeli.
    runner.maintenance()
