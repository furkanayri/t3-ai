"""Yapilandirilmis JSON loglama + correlation id + hassas veri maskeleme.

Prompt, payload, model cevabi, API key ve Authorization header gibi hassas
veriler asla loglanmamalidir. Bu modul ayrica bir guvenlik agi olarak, log
kayitlarina sizan bilinen hassas anahtarlari maskeler.
"""

from __future__ import annotations

import json
import logging
import re
import sys
import uuid
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Any

_correlation_id: ContextVar[str | None] = ContextVar("correlation_id", default=None)

# Log kayitlarinda maskelecek anahtar isimleri (buyuk/kucuk harf duyarsiz).
_SENSITIVE_KEYS = frozenset(
    {
        "authorization",
        "api_key",
        "apikey",
        "api-key",
        "secret",
        "password",
        "token",
        "bearer",
        "idempotency_key",
        "prompt",
        "prompts",
        "messages",
        "content",
        "request",
        "request_payload",
        "payload",
        "result",
        "response",
        "completion",
        "text",
    }
)

_REDACTED = "***"
_BEARER_RE = re.compile(r"(?i)bearer\s+[A-Za-z0-9._\-]+")

# logging.LogRecord uzerindeki standart alanlar; bunlar `extra` sayilmaz.
_STANDARD_RECORD_FIELDS = frozenset(vars(logging.makeLogRecord({})).keys()) | {
    "message",
    "asctime",
    "taskName",
}


def set_correlation_id(value: str | None) -> None:
    _correlation_id.set(value)


def get_correlation_id() -> str | None:
    return _correlation_id.get()


def new_correlation_id() -> str:
    cid = uuid.uuid4().hex
    _correlation_id.set(cid)
    return cid


def _redact(value: Any, key: str | None = None, depth: int = 0) -> Any:
    if key is not None and key.lower() in _SENSITIVE_KEYS:
        return _REDACTED
    if depth > 6:
        return _REDACTED
    if isinstance(value, dict):
        return {k: _redact(v, k, depth + 1) for k, v in value.items()}
    if isinstance(value, list | tuple):
        return [_redact(v, None, depth + 1) for v in value]
    if isinstance(value, str):
        return _BEARER_RE.sub("bearer " + _REDACTED, value)
    return value


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": _BEARER_RE.sub("bearer " + _REDACTED, record.getMessage()),
        }
        cid = get_correlation_id()
        if cid:
            payload["correlation_id"] = cid

        for field, value in record.__dict__.items():
            if field in _STANDARD_RECORD_FIELDS or field.startswith("_"):
                continue
            payload[field] = _redact(value, field)

        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        if record.stack_info:
            payload["stack_info"] = self.formatStack(record.stack_info)

        return json.dumps(payload, ensure_ascii=False, default=str)


def configure_logging(level: str = "INFO") -> None:
    """Kok logger'i JSON formatter ile stdout'a baglar (idempotent)."""

    root = logging.getLogger()
    root.setLevel(level.upper())

    for handler in list(root.handlers):
        root.removeHandler(handler)

    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)

    # Gurultulu kutuphaneleri sakinlestir.
    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn.access").propagate = False
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
