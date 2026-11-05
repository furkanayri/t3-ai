"""Worker retry backoff zamanlama birim testi."""

from __future__ import annotations

from app.services.worker import JobProcessor
from tests.conftest import make_settings


def _processor(backoff: list[int]) -> JobProcessor:
    settings = make_settings(retry_backoff_seconds=backoff)
    # _retry_delay yalnizca settings kullanir; db/model gereksiz.
    return JobProcessor(settings, db=None, model_client=None, worker_id="w")  # type: ignore[arg-type]


def test_retry_delay_follows_schedule() -> None:
    p = _processor([10, 60, 300])
    assert p._retry_delay(1) == 10
    assert p._retry_delay(2) == 60
    assert p._retry_delay(3) == 300


def test_retry_delay_clamps_to_last() -> None:
    p = _processor([10, 60, 300])
    assert p._retry_delay(4) == 300
    assert p._retry_delay(99) == 300


def test_retry_delay_handles_low_attempt() -> None:
    p = _processor([10, 60, 300])
    assert p._retry_delay(0) == 10


def test_retry_delay_empty_schedule_default() -> None:
    p = _processor([])
    assert p._retry_delay(1) == 10
