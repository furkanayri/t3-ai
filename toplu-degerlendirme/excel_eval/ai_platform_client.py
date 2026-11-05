"""ai-platform HTTP istemcisi.

ai-platform'un yapisina dokunmadan yalnizca genel API'sini kullanir:
- ``POST /v1/jobs``  -> is olusturur (202), ``Idempotency-Key`` zorunludur.
- ``GET /v1/jobs/{id}`` -> is durumunu/sonucunu dondurur.

Backpressure (429) ve gecici sunucu hatalarinda (5xx) ustel geri cekilme ile
yeniden dener. Kalici dogrulama hatalarinda (4xx, 429 haric) ``JobError``
firlatir.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import requests


class ApiError(RuntimeError):
    """ai-platform cagrisinda kalici (yeniden denenmeyecek) hata."""

    def __init__(self, message: str, *, status: int | None = None, code: str | None = None):
        super().__init__(message)
        self.status = status
        self.code = code


@dataclass
class JobResult:
    job_id: str
    status: str
    result: dict[str, Any] | None
    execution: dict[str, Any] | None
    error: dict[str, Any] | None


# ai-platform/src/app/domain/enums.py ile ayni terminal durumlar.
TERMINAL_STATUSES = frozenset({"COMPLETED", "FAILED", "DEAD_LETTER"})


class AiPlatformClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        *,
        request_timeout: float = 30.0,
        max_retries: int = 6,
        backoff_base: float = 1.5,
        backoff_cap: float = 30.0,
    ) -> None:
        if not base_url:
            raise ValueError("base_url bos olamaz")
        if not api_key:
            raise ValueError("api_key bos olamaz")
        self._base_url = base_url.rstrip("/")
        self._request_timeout = request_timeout
        self._max_retries = max_retries
        self._backoff_base = backoff_base
        self._backoff_cap = backoff_cap
        self._session = requests.Session()
        self._session.headers.update(
            {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
        )

    def close(self) -> None:
        self._session.close()

    def __enter__(self) -> "AiPlatformClient":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def _sleep_backoff(self, attempt: int, retry_after: str | None) -> None:
        if retry_after:
            try:
                time.sleep(min(float(retry_after), self._backoff_cap))
                return
            except ValueError:
                pass
        delay = min(self._backoff_base ** attempt, self._backoff_cap)
        time.sleep(delay)

    def create_job(
        self,
        *,
        messages: list[dict[str, str]],
        idempotency_key: str,
        generation: dict[str, Any] | None = None,
        response_schema: dict[str, Any] | None = None,
    ) -> str:
        """Is olusturur, ``jobId`` dondurur. Backpressure'da yeniden dener."""

        body: dict[str, Any] = {"messages": messages}
        if generation is not None:
            body["generation"] = generation
        if response_schema is not None:
            body["responseSchema"] = response_schema

        url = f"{self._base_url}/v1/jobs"
        headers = {"Idempotency-Key": idempotency_key}

        attempt = 0
        while True:
            try:
                resp = self._session.post(
                    url, json=body, headers=headers, timeout=self._request_timeout
                )
            except requests.RequestException as exc:
                if attempt >= self._max_retries:
                    raise ApiError(f"Baglanti hatasi: {exc}") from exc
                self._sleep_backoff(attempt, None)
                attempt += 1
                continue

            if resp.status_code in (200, 201, 202):
                return str(resp.json()["jobId"])

            # 409: ayni Idempotency-Key ile var olan is -> govdede jobId doner.
            if resp.status_code == 409:
                try:
                    return str(resp.json()["jobId"])
                except (ValueError, KeyError):
                    pass

            if resp.status_code == 429 or resp.status_code >= 500:
                if attempt >= self._max_retries:
                    raise ApiError(
                        f"Yeniden deneme tukendi (status={resp.status_code})",
                        status=resp.status_code,
                    )
                self._sleep_backoff(attempt, resp.headers.get("Retry-After"))
                attempt += 1
                continue

            raise ApiError(
                _error_text(resp), status=resp.status_code, code=_error_code(resp)
            )

    def get_job(self, job_id: str) -> JobResult:
        url = f"{self._base_url}/v1/jobs/{job_id}"
        attempt = 0
        while True:
            try:
                resp = self._session.get(url, timeout=self._request_timeout)
            except requests.RequestException as exc:
                if attempt >= self._max_retries:
                    raise ApiError(f"Baglanti hatasi: {exc}") from exc
                self._sleep_backoff(attempt, None)
                attempt += 1
                continue

            if resp.status_code == 200:
                data = resp.json()
                return JobResult(
                    job_id=str(data["jobId"]),
                    status=str(data["status"]),
                    result=data.get("result"),
                    execution=data.get("execution"),
                    error=data.get("error"),
                )

            if resp.status_code == 429 or resp.status_code >= 500:
                if attempt >= self._max_retries:
                    raise ApiError(
                        f"Yeniden deneme tukendi (status={resp.status_code})",
                        status=resp.status_code,
                    )
                self._sleep_backoff(attempt, resp.headers.get("Retry-After"))
                attempt += 1
                continue

            raise ApiError(
                _error_text(resp), status=resp.status_code, code=_error_code(resp)
            )

    def wait_for_job(
        self, job_id: str, *, poll_interval: float = 2.0, timeout: float = 1800.0
    ) -> JobResult:
        """Is terminal duruma gelene kadar bekler."""

        deadline = time.monotonic() + timeout
        while True:
            res = self.get_job(job_id)
            if res.status in TERMINAL_STATUSES:
                return res
            if time.monotonic() >= deadline:
                raise ApiError(f"Is zaman asimi (job_id={job_id}, status={res.status})")
            time.sleep(poll_interval)


def _error_text(resp: requests.Response) -> str:
    try:
        data = resp.json()
        return str(data.get("message") or data.get("detail") or resp.text)
    except ValueError:
        return resp.text or f"HTTP {resp.status_code}"


def _error_code(resp: requests.Response) -> str | None:
    try:
        return resp.json().get("code")
    except ValueError:
        return None
