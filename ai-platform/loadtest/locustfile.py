"""Locust yuk testi.

LLM API'yi asenkron job akisi uzerinden zorlar: job olusturur (POST /v1/jobs) ve
olusturulan job'lari sorgular (GET /v1/jobs/{id}). API model sonucunu beklemedigi
icin olusturma gecikmesi dusuktur; is ayri worker'larda islenir.

Parametreler ortam degiskenleriyle ayarlanir (scenario script'i bunlari set eder):

    LOADTEST_API_KEY         : Bearer API anahtari (zorunlu)
    LOADTEST_PROMPT_CHARS    : Prompt uzunlugu (varsayilan 200)
    LOADTEST_USE_SCHEMA      : "1" ise response schema gonderilir
    LOADTEST_MAX_OUTPUT      : maxOutputTokens (varsayilan 128)
    LOADTEST_POLL            : "1" ise olusturulan job'lar ayrica sorgulanir

Calistirma ornegi:
    locust -f loadtest/locustfile.py --host http://localhost:8080 \
        --users 50 --spawn-rate 10 --run-time 2m --headless \
        --html loadtest/reports/rapor.html
"""

from __future__ import annotations

import os
import random
import string
import uuid

from locust import HttpUser, between, task

_API_KEY = os.environ.get("LOADTEST_API_KEY", "")
_PROMPT_CHARS = int(os.environ.get("LOADTEST_PROMPT_CHARS", "200"))
_USE_SCHEMA = os.environ.get("LOADTEST_USE_SCHEMA", "0") == "1"
_MAX_OUTPUT = int(os.environ.get("LOADTEST_MAX_OUTPUT", "128"))
_POLL = os.environ.get("LOADTEST_POLL", "1") == "1"

_SCHEMA = {
    "type": "object",
    "properties": {"ozet": {"type": "string"}},
    "required": ["ozet"],
}


def _random_prompt(n: int) -> str:
    alphabet = string.ascii_letters + "     "
    return "".join(random.choice(alphabet) for _ in range(n))


class LLMUser(HttpUser):
    wait_time = between(0.1, 1.0)

    def on_start(self) -> None:
        if not _API_KEY:
            raise RuntimeError("LOADTEST_API_KEY tanimli degil")
        self._headers = {"Authorization": f"Bearer {_API_KEY}"}
        self._created: list[str] = []

    @task(5)
    def create_job(self) -> None:
        body: dict = {
            "messages": [{"role": "user", "content": _random_prompt(_PROMPT_CHARS)}],
            "generation": {"temperature": 0.2, "maxOutputTokens": _MAX_OUTPUT},
        }
        if _USE_SCHEMA:
            body["responseSchema"] = _SCHEMA
        headers = {**self._headers, "Idempotency-Key": uuid.uuid4().hex}
        with self.client.post(
            "/v1/jobs", json=body, headers=headers, name="POST /v1/jobs", catch_response=True
        ) as resp:
            if resp.status_code == 202:
                try:
                    job_id = resp.json()["jobId"]
                    if len(self._created) < 200:
                        self._created.append(job_id)
                except Exception:  # noqa: BLE001
                    resp.failure("gecersiz cevap govdesi")
            elif resp.status_code in (429, 503):
                # Backpressure beklenen bir davranistir; basarisizlik sayilmaz.
                resp.success()
            else:
                resp.failure(f"beklenmeyen status {resp.status_code}")

    @task(3)
    def poll_job(self) -> None:
        if not _POLL or not self._created:
            return
        job_id = random.choice(self._created)
        self.client.get(f"/v1/jobs/{job_id}", headers=self._headers, name="GET /v1/jobs/{id}")

    @task(1)
    def health(self) -> None:
        self.client.get("/health/ready", name="GET /health/ready")
