"""Istek dogrulama ve girdi limiti birim testleri."""

from __future__ import annotations

import pytest

from app.domain.errors import PayloadTooLargeError, RequestValidationError
from app.domain.schemas import CreateJobRequest, Generation, Message
from app.domain.validation import estimate_tokens, validate_create_request
from tests.conftest import make_settings


def _req(contents: list[str], generation: Generation | None = None, schema: dict | None = None):
    return CreateJobRequest(
        messages=[Message(role="user", content=c) for c in contents],
        generation=generation,
        response_schema=schema,
    )


def test_estimate_tokens() -> None:
    assert estimate_tokens("") == 0
    assert estimate_tokens("abcd") == 1
    assert estimate_tokens("abcde") == 2


def test_valid_request_returns_generation() -> None:
    settings = make_settings()
    gen = validate_create_request(_req(["Merhaba dunya"]), settings)
    assert gen["temperature"] == settings.temperature_min
    assert gen["maxOutputTokens"] == settings.max_output_tokens


def test_empty_messages_rejected() -> None:
    settings = make_settings()
    with pytest.raises(RequestValidationError):
        validate_create_request(_req([]), settings)


def test_too_many_messages_rejected() -> None:
    settings = make_settings(max_messages=2)
    with pytest.raises(RequestValidationError):
        validate_create_request(_req(["a", "b", "c"]), settings)


def test_empty_content_rejected() -> None:
    settings = make_settings()
    with pytest.raises(RequestValidationError):
        validate_create_request(_req(["   "]), settings)


def test_total_chars_limit() -> None:
    settings = make_settings(max_total_input_chars=5)
    with pytest.raises(PayloadTooLargeError):
        validate_create_request(_req(["uzun bir metin"]), settings)


def test_input_tokens_limit() -> None:
    settings = make_settings(max_input_tokens=1, max_total_input_chars=10_000)
    with pytest.raises(PayloadTooLargeError):
        validate_create_request(_req(["kelime kelime kelime"]), settings)


def test_temperature_out_of_range_rejected() -> None:
    settings = make_settings(temperature_max=2.0)
    with pytest.raises(RequestValidationError):
        validate_create_request(_req(["x"], Generation(temperature=5.0)), settings)


def test_max_output_tokens_global_cap() -> None:
    settings = make_settings(max_output_tokens=100)
    with pytest.raises(RequestValidationError):
        validate_create_request(_req(["x"], Generation(max_output_tokens=500)), settings)


def test_max_output_tokens_project_cap() -> None:
    settings = make_settings(max_output_tokens=1000)
    with pytest.raises(RequestValidationError):
        validate_create_request(
            _req(["x"], Generation(max_output_tokens=200)),
            settings,
            project_max_output_tokens=50,
        )


def test_generation_values_normalized() -> None:
    settings = make_settings(max_output_tokens=1000, temperature_max=2.0)
    gen = validate_create_request(
        _req(["x"], Generation(temperature=0.7, max_output_tokens=256, top_p=0.9)),
        settings,
    )
    assert gen["temperature"] == 0.7
    assert gen["maxOutputTokens"] == 256
    assert gen["topP"] == 0.9


def test_invalid_response_schema_rejected() -> None:
    settings = make_settings()
    bad = {"type": "object", "patternProperties": {".*": {"type": "string"}}}
    with pytest.raises(RequestValidationError):
        validate_create_request(_req(["x"], schema=bad), settings)
