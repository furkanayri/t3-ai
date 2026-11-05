"""Istek govdesi dogrulamalari ve girdi limitleri.

Kalici (retry edilmeyecek) dogrulama hatalari burada tespit edilir; job
olusturulmadan HTTP 4xx ile reddedilir.
"""

from __future__ import annotations

import math
from typing import Any

from app.config import Settings
from app.domain.errors import PayloadTooLargeError, RequestValidationError
from app.domain.json_schema import validate_response_schema
from app.domain.schemas import CreateJobRequest


def estimate_tokens(text: str) -> int:
    """Kaba token tahmini (~4 karakter/token). Sadece limit uygulamak icin."""

    if not text:
        return 0
    return math.ceil(len(text) / 4)


def validate_create_request(
    req: CreateJobRequest,
    settings: Settings,
    *,
    project_max_output_tokens: int | None = None,
) -> dict[str, Any]:
    """Istegi dogrular ve normalize edilmis generation secenekleri dondurur.

    Dondurulen sozluk job kaydina yazilacak kesinlesmis generation ayarlaridir.
    """

    # messages bos olamaz
    if not req.messages:
        raise RequestValidationError("messages bos olamaz")

    if len(req.messages) > settings.max_messages:
        raise RequestValidationError(
            f"Mesaj sayisi {settings.max_messages} sinirini asamaz"
        )

    total_chars = 0
    for idx, msg in enumerate(req.messages):
        if not msg.content or not msg.content.strip():
            raise RequestValidationError(f"Mesaj icerigi bos olamaz (index={idx})")
        total_chars += len(msg.content)

    if total_chars > settings.max_total_input_chars:
        raise PayloadTooLargeError(
            f"Toplam girdi karakteri {settings.max_total_input_chars} sinirini asiyor"
        )

    estimated = estimate_tokens(" ".join(m.content for m in req.messages))
    if estimated > settings.max_input_tokens:
        raise PayloadTooLargeError(
            f"Tahmini girdi token sayisi {settings.max_input_tokens} sinirini asiyor"
        )

    # generation
    temperature = settings.temperature_min
    top_p: float | None = None
    requested_max = None

    if req.generation is not None:
        if req.generation.temperature is not None:
            temperature = req.generation.temperature
            if not (settings.temperature_min <= temperature <= settings.temperature_max):
                raise RequestValidationError(
                    f"temperature {settings.temperature_min}-{settings.temperature_max} "
                    "araliginda olmalidir"
                )
        top_p = req.generation.top_p
        requested_max = req.generation.max_output_tokens

    # maxOutputTokens global ve proje sinirini asamaz
    effective_cap = settings.max_output_tokens
    if project_max_output_tokens is not None:
        effective_cap = min(effective_cap, project_max_output_tokens)

    if requested_max is None:
        resolved_max = effective_cap
    else:
        if requested_max > effective_cap:
            raise RequestValidationError(
                f"maxOutputTokens en fazla {effective_cap} olabilir"
            )
        resolved_max = requested_max

    # response schema
    if req.response_schema is not None:
        validate_response_schema(req.response_schema, settings)

    generation: dict[str, Any] = {
        "temperature": temperature,
        "maxOutputTokens": resolved_max,
    }
    if top_p is not None:
        generation["topP"] = top_p
    return generation
