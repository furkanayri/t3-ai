"""Log maskeleme (redaction) birim testleri.

Prompt, payload, model cevabi, Authorization/Bearer gibi hassas veriler asla
loglanmamali; bu modul son guvenlik agidir.
"""

from __future__ import annotations

import json
import logging

from app.logging import (
    JsonFormatter,
    _redact,
    get_correlation_id,
    new_correlation_id,
    set_correlation_id,
)


def test_redact_sensitive_keys() -> None:
    out = _redact(
        {
            "password": "hunter2",
            "authorization": "Bearer abc",
            "prompt": "gizli",
            "messages": [{"content": "x"}],
            "keep": "gorunur",
        }
    )
    assert out["password"] == "***"
    assert out["authorization"] == "***"
    assert out["prompt"] == "***"
    assert out["messages"] == "***"
    assert out["keep"] == "gorunur"


def test_redact_nested() -> None:
    out = _redact({"outer": {"secret": "s", "ok": "v"}})
    assert out["outer"]["secret"] == "***"
    assert out["outer"]["ok"] == "v"


def test_redact_bearer_in_string() -> None:
    assert _redact("Authorization: Bearer abc123.def-456") == "Authorization: bearer ***"


def test_formatter_redacts_extra_and_message() -> None:
    record = logging.LogRecord(
        name="t",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="giris bearer sometoken.value yapildi",
        args=(),
        exc_info=None,
    )
    record.password = "hunter2"  # type: ignore[attr-defined]
    record.job_id = "abc"  # type: ignore[attr-defined]
    out = json.loads(JsonFormatter().format(record))
    assert out["message"] == "giris bearer *** yapildi"
    assert out["password"] == "***"
    assert out["job_id"] == "abc"
    assert out["level"] == "INFO"


def test_correlation_id_contextvar() -> None:
    set_correlation_id(None)
    assert get_correlation_id() is None
    cid = new_correlation_id()
    assert get_correlation_id() == cid
    set_correlation_id("manual")
    assert get_correlation_id() == "manual"


def test_formatter_includes_correlation_id() -> None:
    set_correlation_id("cid-123")
    record = logging.LogRecord(
        name="t", level=logging.INFO, pathname=__file__, lineno=1,
        msg="ok", args=(), exc_info=None,
    )
    out = json.loads(JsonFormatter().format(record))
    assert out["correlation_id"] == "cid-123"
    set_correlation_id(None)
