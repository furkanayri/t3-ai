"""Faz 2 uctan uca: submit -> isle (tek worker) -> sealed sonuc -> teslim.

Dogrulananlar:
- Belge profili INGEST -> EXTRACT -> (OCR graceful degrade) -> EVALUATE -> DONE.
- Orijinal + ara byte'lar islem sonunda ephemeral'dan silinir (kalici degil).
- Sonuc GET /result'ta teslim edilip silinir (delete-on-delivery).
- Tenant izolasyonu + token zorunlulugu.
"""

import pytest
from fastapi.testclient import TestClient

from api.app import app
from api.auth import reload_tokens
from orchestrator import db
from orchestrator.dispatch import InMemoryDispatcher, set_dispatcher
from platform_core import bootstrap, ephemeral
from tests.synthetic import pdf as synthetic_pdf
from workers import light


@pytest.fixture
def ctx():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(InMemoryDispatcher())
    tokens = reload_tokens()
    tenant_token = next(iter(tokens["tenants"]))
    return TestClient(app), tenant_token


def _submit(client, token, data, document_type="STUDENT"):
    return client.post(
        "/v1/assets",
        content=data,
        headers={
            "Authorization": f"Bearer {token}",
            "X-Document-Type": document_type,
            "Content-Type": "application/octet-stream",
        },
    )


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_document_profile_end_to_end(ctx):
    client, token = ctx
    submit = _submit(client, token, synthetic_pdf())
    assert submit.status_code == 202, submit.text
    job_id = submit.json()["job_id"]
    asset_id = submit.json()["asset_id"]

    processed = light.run_until_idle()
    assert processed >= 4  # INGEST, EXTRACT, EVALUATE, OCR(degrade), EVALUATE

    status = client.get(f"/v1/jobs/{job_id}", headers=_auth(token))
    assert status.status_code == 200
    assert status.json()["status"] == "COMPLETED"
    assert status.json()["result_ready"] is True

    # Orijinal + ara byte'lar silinmis olmali (processor, system-of-record degil).
    assert ephemeral.exists(asset_id, "QUARANTINE") is False
    assert ephemeral.exists(asset_id, "ORIGINAL") is False
    assert ephemeral.exists(asset_id, "PDF_TEXT", job_id) is False

    result = client.get(f"/v1/jobs/{job_id}/result", headers=_auth(token))
    assert result.status_code == 200, result.text
    body = result.json()
    assert body["document_family"] == "YOK"
    assert body["student_status"] == "ACTIVE"
    assert body["identity"]["tckn_mask"].endswith("0146")
    assert "tckn" not in body["identity"]  # ham TCKN disa verilmez

    # delete-on-delivery: ikinci okuma 404.
    again = client.get(f"/v1/jobs/{job_id}/result", headers=_auth(token))
    assert again.status_code == 404


def test_result_requires_processing_first(ctx):
    client, token = ctx
    submit = _submit(client, token, synthetic_pdf())
    job_id = submit.json()["job_id"]
    # Henuz islenmedi -> sealed sonuc yok.
    assert client.get(f"/v1/jobs/{job_id}/result", headers=_auth(token)).status_code == 404


def test_cancel_marks_cancelled_and_wipes(ctx):
    client, token = ctx
    submit = _submit(client, token, synthetic_pdf())
    job_id = submit.json()["job_id"]
    asset_id = submit.json()["asset_id"]

    cancel = client.post(f"/v1/jobs/{job_id}/cancel", headers=_auth(token))
    assert cancel.status_code == 200
    assert cancel.json()["status"] == "CANCELLED"
    assert ephemeral.exists(asset_id, "QUARANTINE") is False

    status = client.get(f"/v1/jobs/{job_id}", headers=_auth(token))
    assert status.json()["status"] == "CANCELLED"


def test_auth_required(ctx):
    client, _ = ctx
    # Token yok -> 403.
    assert _submit(client, "", synthetic_pdf()).status_code == 403
    # Gecersiz token -> 403.
    assert client.get("/v1/jobs/whatever", headers=_auth("bogus")).status_code == 403


def test_unknown_job_is_404(ctx):
    client, token = ctx
    missing = client.get(
        "/v1/jobs/00000000-0000-0000-0000-0000000000aa", headers=_auth(token)
    )
    assert missing.status_code == 404
