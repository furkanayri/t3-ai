"""Response JSON Schema guvenli-altkume ve cikti dogrulama testleri."""

from __future__ import annotations

import pytest

from app.domain.enums import ErrorCode
from app.domain.errors import ProcessingError, RequestValidationError
from app.domain.json_schema import (
    validate_output_against_schema,
    validate_response_schema,
)
from tests.conftest import make_settings

SETTINGS = make_settings()

VALID_SCHEMA = {
    "type": "object",
    "properties": {
        "answer": {"type": "string"},
        "score": {"type": "integer", "minimum": 0, "maximum": 10},
    },
    "required": ["answer"],
}


def test_valid_schema_accepted() -> None:
    validate_response_schema(VALID_SCHEMA, SETTINGS)


def test_unsupported_keyword_rejected() -> None:
    schema = {"type": "object", "patternProperties": {".*": {"type": "string"}}}
    with pytest.raises(RequestValidationError):
        validate_response_schema(schema, SETTINGS)


def test_unsupported_type_rejected() -> None:
    schema = {"type": "fancy"}
    with pytest.raises(RequestValidationError):
        validate_response_schema(schema, SETTINGS)


def test_too_deep_schema_rejected() -> None:
    settings = make_settings(max_response_schema_depth=2)
    deep = {"type": "object", "properties": {"a": {"type": "object", "properties": {
        "b": {"type": "object", "properties": {"c": {"type": "string"}}}
    }}}}
    with pytest.raises(RequestValidationError):
        validate_response_schema(deep, settings)


def test_too_large_schema_rejected() -> None:
    settings = make_settings(max_response_schema_bytes=64)
    big = {"type": "object", "properties": {f"f{i}": {"type": "string"} for i in range(50)}}
    with pytest.raises(RequestValidationError):
        validate_response_schema(big, settings)


def test_too_many_properties_rejected() -> None:
    settings = make_settings(max_response_schema_properties=3)
    schema = {"type": "object", "properties": {f"f{i}": {"type": "string"} for i in range(10)}}
    with pytest.raises(RequestValidationError):
        validate_response_schema(schema, settings)


def test_output_validation_passes() -> None:
    validate_output_against_schema({"answer": "evet", "score": 5}, VALID_SCHEMA)


def test_output_validation_fails_with_schema_error() -> None:
    with pytest.raises(ProcessingError) as exc_info:
        validate_output_against_schema({"score": 5}, VALID_SCHEMA)  # 'answer' eksik
    assert exc_info.value.error_code is ErrorCode.SCHEMA_VALIDATION_FAILED
    assert not exc_info.value.transient
