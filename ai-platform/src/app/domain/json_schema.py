"""Response JSON Schema dogrulama ve guvenli altkume kontrolu.

Istemcinin verdigi response schema:
- Boyut, derinlik ve property sayisi sinirlandirilir.
- Yalnizca desteklenen (deterministik, sinirli) JSON Schema anahtarlarina izin
  verilir; desteklenmeyen ozellikler kontrollu bicimde reddedilir.

Model ciktisi daha sonra bu sema ile dogrulanir.
"""

from __future__ import annotations

import json
from typing import Any

from jsonschema import Draft202012Validator
from jsonschema import ValidationError as JsonSchemaValidationError
from jsonschema.exceptions import SchemaError

from app.config import Settings
from app.domain.enums import ErrorCode
from app.domain.errors import ProcessingError, RequestValidationError

# Desteklenen JSON Schema anahtarlari (guvenli, sinirli altkume).
_ALLOWED_KEYWORDS = frozenset(
    {
        "type",
        "properties",
        "required",
        "items",
        "enum",
        "const",
        "minimum",
        "maximum",
        "exclusiveMinimum",
        "exclusiveMaximum",
        "minLength",
        "maxLength",
        "minItems",
        "maxItems",
        "additionalProperties",
        "title",
        "description",
    }
)
_ALLOWED_TYPES = frozenset(
    {"object", "array", "string", "number", "integer", "boolean", "null"}
)


def _walk(node: Any, settings: Settings, depth: int, prop_counter: list[int]) -> None:
    if depth > settings.max_response_schema_depth:
        raise RequestValidationError(
            f"Response schema derinligi {settings.max_response_schema_depth} degerini asiyor",
            code="invalid_response_schema",
        )
    if isinstance(node, dict):
        for key, value in node.items():
            if key not in _ALLOWED_KEYWORDS:
                raise RequestValidationError(
                    f"Desteklenmeyen JSON Schema anahtari: '{key}'",
                    code="invalid_response_schema",
                )
            if key == "type":
                types = value if isinstance(value, list) else [value]
                for t in types:
                    if t not in _ALLOWED_TYPES:
                        raise RequestValidationError(
                            f"Desteklenmeyen JSON Schema tipi: '{t}'",
                            code="invalid_response_schema",
                        )
            if key == "properties" and isinstance(value, dict):
                prop_counter[0] += len(value)
                if prop_counter[0] > settings.max_response_schema_properties:
                    raise RequestValidationError(
                        "Response schema property sayisi sinirini asiyor",
                        code="invalid_response_schema",
                    )
                for sub in value.values():
                    _walk(sub, settings, depth + 1, prop_counter)
            elif key == "items" or key == "additionalProperties" and isinstance(value, dict):
                _walk(value, settings, depth + 1, prop_counter)
    elif isinstance(node, list):
        for item in node:
            _walk(item, settings, depth + 1, prop_counter)


def validate_response_schema(schema: dict[str, Any], settings: Settings) -> None:
    """Istemcinin verdigi response schema'yi guvenlik/limit acisindan dogrular.

    Gecersizse RequestValidationError firlatir (HTTP 422, kalici hata).
    """

    if not isinstance(schema, dict):
        raise RequestValidationError(
            "responseSchema bir nesne olmalidir", code="invalid_response_schema"
        )

    serialized = json.dumps(schema, ensure_ascii=False)
    if len(serialized.encode("utf-8")) > settings.max_response_schema_bytes:
        raise RequestValidationError(
            "Response schema boyutu sinirini asiyor", code="invalid_response_schema"
        )

    _walk(schema, settings, depth=1, prop_counter=[0])

    # Sema kendisi gecerli bir JSON Schema mi?
    try:
        Draft202012Validator.check_schema(schema)
    except SchemaError as exc:
        raise RequestValidationError(
            f"Gecersiz JSON Schema: {exc.message}", code="invalid_response_schema"
        ) from exc


def validate_output_against_schema(data: Any, schema: dict[str, Any]) -> None:
    """Model ciktisini verilen sema ile dogrular.

    Uymazsa ProcessingError(SCHEMA_VALIDATION_FAILED) firlatir (kalici hata).
    """

    try:
        Draft202012Validator(schema).validate(data)
    except JsonSchemaValidationError as exc:
        raise ProcessingError(
            ErrorCode.SCHEMA_VALIDATION_FAILED,
            f"Model ciktisi response schema ile uyusmuyor: {exc.message}",
        ) from exc
