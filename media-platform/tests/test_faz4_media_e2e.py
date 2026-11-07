"""Faz 4 uctan uca medya: submit wav -> INGEST -> DEMUX -> ASR fan-out ->
MERGE fan-in -> sealed transcript -> teslim.

ASR motoru (faster-whisper) burada sahte modelle enjekte edilir (GPU/agirlik
gerektirmeden fan-out/fan-in ve muhurleme yolunu dogrular). Dogrulananlar:
- Medya DAG'i cok-chunk'li fan-out/barrier/fan-in ile tek transcript uretir.
- Orijinal medya + tum chunk byte'lari islem sonunda silinir (kalici degil).
- Sonuc transcript olarak teslim edilip silinir (delete-on-delivery).
"""

import pytest
from fastapi.testclient import TestClient

from api.app import app
from api.auth import reload_tokens
from orchestrator import db
from orchestrator.dispatch import InMemoryDispatcher, set_dispatcher
from platform_core import bootstrap, ephemeral
from services.asr import faster_whisper
from services.media import vad
from tests.synthetic_media import speech_wav
from workers import light


class _FakeSeg:
    def __init__(self, start, end, text, avg_logprob=-0.2):
        self.start, self.end, self.text, self.avg_logprob = start, end, text, avg_logprob


class _FakeModel:
    """Her chunk icin chunk-goreli tek segment dondurur (offset motor tarafindan)."""

    def transcribe(self, audio, **kwargs):
        duration = len(audio) / vad.TARGET_RATE
        return ([_FakeSeg(0.0, duration, "soz")], {})


@pytest.fixture
def ctx():
    bootstrap.ensure_all()
    db.reset_engine()
    set_dispatcher(InMemoryDispatcher())
    faster_whisper.set_model(_FakeModel())
    tokens = reload_tokens()
    tenant_token = next(iter(tokens["tenants"]))
    yield TestClient(app), tenant_token
    faster_whisper.set_model(None)


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def _submit_media(client, token, data):
    return client.post(
        "/v1/assets",
        content=data,
        headers={
            "Authorization": f"Bearer {token}",
            "X-Profile": "media",
            "Content-Type": "application/octet-stream",
        },
    )


def test_media_profile_end_to_end(ctx):
    client, token = ctx
    submit = _submit_media(client, token, speech_wav())
    assert submit.status_code == 202, submit.text
    job_id = submit.json()["job_id"]
    asset_id = submit.json()["asset_id"]

    processed = light.run_until_idle()
    assert processed >= 4  # INGEST, DEMUX, >=1 ASR chunk, MERGE

    status = client.get(f"/v1/jobs/{job_id}", headers=_auth(token))
    assert status.status_code == 200
    assert status.json()["status"] == "COMPLETED"
    assert status.json()["result_ready"] is True

    # Orijinal medya + tum chunk byte'lari silinmis olmali (processor degil, kayit degil).
    assert ephemeral.exists(asset_id, "QUARANTINE") is False
    assert ephemeral.exists(asset_id, "ORIGINAL") is False

    result = client.get(f"/v1/jobs/{job_id}/result", headers=_auth(token))
    assert result.status_code == 200, result.text
    body = result.json()
    assert body["kind"] == "TRANSCRIPT"
    assert body["duration"] > 0
    assert len(body["segments"]) >= 1
    assert body["text"]  # bos degil
    # Segmentler azalmayan baslangic sirasinda (merge garantisi).
    starts = [s["start"] for s in body["segments"]]
    assert starts == sorted(starts)

    # delete-on-delivery: ikinci okuma 404.
    again = client.get(f"/v1/jobs/{job_id}/result", headers=_auth(token))
    assert again.status_code == 404


def test_media_rejects_non_media_bytes(ctx):
    client, token = ctx
    bad = _submit_media(client, token, b"%PDF-1.7\n not media \n")
    assert bad.status_code >= 400
