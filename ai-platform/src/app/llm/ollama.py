"""Ollama model client (httpx connection pooling + keep-alive + timeout).

Model adi yalnizca ortam degiskeninden (OLLAMA_MODEL) gelir. Response schema
verildiginde Ollama'dan yapilandirilmis JSON istenir (``format`` alani);
verilmediginde normal metin cevap desteklenir.
"""

from __future__ import annotations

import time
from typing import Any

import httpx

from app.config import Settings
from app.domain.enums import ErrorCode
from app.domain.errors import ProcessingError
from app.llm.base import InferenceRequest, InferenceResult, ModelClient
from app.logging import get_logger

logger = get_logger(__name__)


class OllamaClient(ModelClient):
    def __init__(self, settings: Settings):
        self._settings = settings
        self._model = settings.ollama_model
        timeout = httpx.Timeout(
            timeout=settings.ollama_timeout_seconds,
            connect=settings.ollama_connect_timeout_seconds,
        )
        limits = httpx.Limits(
            max_connections=settings.ollama_max_connections,
            max_keepalive_connections=settings.ollama_max_connections,
        )
        self._client = httpx.AsyncClient(
            base_url=settings.ollama_host.rstrip("/"),
            timeout=timeout,
            limits=limits,
        )

    @property
    def provider(self) -> str:
        return "ollama"

    @property
    def model(self) -> str:
        return self._model

    async def generate(self, request: InferenceRequest) -> InferenceResult:
        options: dict[str, Any] = {
            "temperature": request.temperature,
            "num_predict": request.max_output_tokens,
        }
        if request.top_p is not None:
            options["top_p"] = request.top_p

        body: dict[str, Any] = {
            "model": self._model,
            "messages": request.messages,
            "stream": False,
            "keep_alive": self._settings.ollama_keep_alive,
            "options": options,
        }
        if request.json_schema is not None:
            # Ollama yapilandirilmis cikti: JSON Schema'yi dogrudan format olarak verir.
            body["format"] = request.json_schema

        started = time.perf_counter()
        try:
            response = await self._client.post("/api/chat", json=body)
        except httpx.ConnectError as exc:
            raise ProcessingError(ErrorCode.OLLAMA_CONNECTION, "Ollama'ya baglanilamadi") from exc
        except httpx.TimeoutException as exc:
            raise ProcessingError(ErrorCode.OLLAMA_TIMEOUT, "Ollama zaman asimi") from exc
        except httpx.HTTPError as exc:
            raise ProcessingError(
                ErrorCode.OLLAMA_CONNECTION, f"Ollama HTTP hatasi: {exc}"
            ) from exc

        if response.status_code >= 500 or response.status_code == 429:
            raise ProcessingError(
                ErrorCode.OLLAMA_UNAVAILABLE,
                f"Ollama gecici hata (status={response.status_code})",
            )
        if response.status_code >= 400:
            # Istek seviyesi hata (orn. model bulunamadi) - gecici kabul edilir ki
            # model-init tamamlanana kadar retry edilebilsin.
            raise ProcessingError(
                ErrorCode.OLLAMA_UNAVAILABLE,
                f"Ollama istek hatasi (status={response.status_code})",
            )

        data = response.json()
        duration_ms = int((time.perf_counter() - started) * 1000)
        text = str(data.get("message", {}).get("content", ""))
        prompt_tokens = data.get("prompt_eval_count")
        completion_tokens = data.get("eval_count")

        return InferenceResult(
            text=text,
            prompt_tokens=int(prompt_tokens) if prompt_tokens is not None else None,
            completion_tokens=int(completion_tokens) if completion_tokens is not None else None,
            duration_ms=duration_ms,
            raw=data,
        )

    async def health(self) -> bool:
        try:
            response = await self._client.get("/api/version", timeout=5.0)
            return response.status_code == 200
        except httpx.HTTPError:
            return False

    async def warmup(self) -> None:
        try:
            await self._client.post(
                "/api/chat",
                json={
                    "model": self._model,
                    "messages": [{"role": "user", "content": "ping"}],
                    "stream": False,
                    "keep_alive": self._settings.ollama_keep_alive,
                    "options": {"num_predict": 1},
                },
            )
            logger.info("ollama warmup tamamlandi", extra={"model": self._model})
        except httpx.HTTPError as exc:
            logger.warning("ollama warmup basarisiz", extra={"error": str(exc)})

    async def aclose(self) -> None:
        await self._client.aclose()


def build_model_client(settings: Settings) -> ModelClient:
    if settings.model_provider == "ollama":
        return OllamaClient(settings)
    raise RuntimeError(f"Desteklenmeyen model saglayici: {settings.model_provider}")
