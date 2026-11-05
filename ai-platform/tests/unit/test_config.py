"""Konfigurasyon normalizasyon ve fail-fast birim testleri."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.config import Settings
from tests.conftest import make_settings


def test_spec_async_scheme_normalized() -> None:
    s = make_settings(database_url="postgresql+psycopg_async://u:p@h:5432/db")
    assert s.database_url == "postgresql+psycopg://u:p@h:5432/db"


def test_plain_postgres_scheme_normalized() -> None:
    s = make_settings(database_url="postgresql://u:p@h:5432/db")
    assert s.database_url == "postgresql+psycopg://u:p@h:5432/db"


def test_already_normalized_scheme_unchanged() -> None:
    s = make_settings(database_url="postgresql+psycopg://u:p@h:5432/db")
    assert s.database_url == "postgresql+psycopg://u:p@h:5432/db"


def test_retry_backoff_parsed_from_string() -> None:
    s = make_settings(retry_backoff_seconds="10,60,300")
    assert s.retry_backoff_seconds == [10, 60, 300]


def test_retry_backoff_list_passthrough() -> None:
    s = make_settings(retry_backoff_seconds=[5, 15])
    assert s.retry_backoff_seconds == [5, 15]


def test_missing_required_fields_fail_fast(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("API_KEY_HMAC_SECRET", raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None)  # type: ignore[call-arg]
