"""Olay payload'lari ve consumer mesaj semasi testleri.

Kritik: Kafka mesaji metadata-only olmali (prompt/icerik TASIMAMALI) ve consumer
camelCase payload'u dogru parse etmeli.
"""

from __future__ import annotations

import json
import uuid

from app.db.models import Job
from app.domain import events
from app.domain.enums import EventType
from app.domain.events import JobEventMessage
from tests.conftest import make_settings


def _job(**overrides: object) -> Job:
    base: dict[str, object] = {
        "id": uuid.uuid4(),
        "project_id": uuid.uuid4(),
        "idempotency_key": "k",
        "status": "QUEUED",
        "request_payload": {"messages": [{"role": "user", "content": "GIZLI PROMPT"}]},
        "model_provider": "ollama",
        "model_name": "gemma3:4b-it-q4_K_M",
        "attempt": 2,
    }
    base.update(overrides)
    return Job(**base)


def test_requested_event_is_metadata_only() -> None:
    settings = make_settings()
    job = _job()
    topic, event_type, payload = events.requested_event(settings, job, "cid-1")
    assert topic == settings.kafka_topic_requested
    assert event_type is EventType.JOB_REQUESTED
    assert payload["jobId"] == str(job.id)
    assert payload["projectId"] == str(job.project_id)
    assert payload["attempt"] == 2
    assert payload["correlationId"] == "cid-1"
    # Hassas icerik mesaja SIZMAMALI.
    serialized = json.dumps(payload)
    assert "GIZLI PROMPT" not in serialized
    assert "messages" not in payload
    assert "prompt" not in payload


def test_failed_and_dlq_events_carry_error_code() -> None:
    settings = make_settings()
    job = _job(error_code="ollama_timeout")
    _, _, failed = events.failed_event(settings, job, None)
    assert failed["errorCode"] == "ollama_timeout"
    topic, event_type, dlq = events.dead_letter_event(settings, job, None)
    assert topic == settings.kafka_topic_dlq
    assert event_type is EventType.JOB_DEAD_LETTER
    assert dlq["errorCode"] == "ollama_timeout"


def test_job_event_message_parses_camelcase_payload() -> None:
    settings = make_settings()
    job = _job()
    _, _, payload = events.requested_event(settings, job, "cid-9")
    raw = json.dumps(payload).encode("utf-8")
    message = JobEventMessage.model_validate_json(raw)
    assert message.job_id == job.id
    assert message.project_id == job.project_id
    assert message.attempt == 2
    assert message.correlation_id == "cid-9"
    assert message.event_type == EventType.JOB_REQUESTED.value
