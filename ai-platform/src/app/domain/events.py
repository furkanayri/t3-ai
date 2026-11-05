"""Kafka olay (outbox) payload'lari ve consumer mesaj semasi.

Kafka mesajlari tam prompt veya model cevabi TASIMAZ; yalnizca gerekli metadata
tasir. Worker gercek job icerigini PostgreSQL'den okur.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.config import Settings
from app.db.models import Job
from app.domain.enums import EventType


class JobEventMessage(BaseModel):
    """Kafka'dan gelen mesajin dogrulanmis semasi.

    Outbox payload'lari camelCase anahtarlarla (``jobId``, ``eventType`` ...)
    serilestirilir; bu nedenle alias uretici camelCase'tir ve hem alias hem alan
    adiyla doldurmaya izin verilir.
    """

    model_config = ConfigDict(
        extra="ignore", alias_generator=to_camel, populate_by_name=True
    )

    event_id: str
    event_type: str
    event_version: str
    job_id: uuid.UUID
    project_id: uuid.UUID
    attempt: int
    correlation_id: str | None = None
    created_at: str


def _base_payload(
    job: Job, event_type: EventType, correlation_id: str | None
) -> dict[str, Any]:
    return {
        "eventId": uuid.uuid4().hex,
        "eventType": event_type.value,
        "eventVersion": "1",
        "jobId": str(job.id),
        "projectId": str(job.project_id),
        "attempt": job.attempt,
        "correlationId": correlation_id,
        "createdAt": datetime.now(tz=UTC).isoformat(),
    }


def requested_event(
    settings: Settings, job: Job, correlation_id: str | None
) -> tuple[str, EventType, dict[str, Any]]:
    return (
        settings.kafka_topic_requested,
        EventType.JOB_REQUESTED,
        _base_payload(job, EventType.JOB_REQUESTED, correlation_id),
    )


def completed_event(
    settings: Settings, job: Job, correlation_id: str | None
) -> tuple[str, EventType, dict[str, Any]]:
    return (
        settings.kafka_topic_events,
        EventType.JOB_COMPLETED,
        _base_payload(job, EventType.JOB_COMPLETED, correlation_id),
    )


def failed_event(
    settings: Settings, job: Job, correlation_id: str | None
) -> tuple[str, EventType, dict[str, Any]]:
    payload = _base_payload(job, EventType.JOB_FAILED, correlation_id)
    payload["errorCode"] = job.error_code
    return settings.kafka_topic_events, EventType.JOB_FAILED, payload


def retry_event(
    settings: Settings, job: Job, correlation_id: str | None
) -> tuple[str, EventType, dict[str, Any]]:
    return (
        settings.kafka_topic_events,
        EventType.JOB_RETRY,
        _base_payload(job, EventType.JOB_RETRY, correlation_id),
    )


def dead_letter_event(
    settings: Settings, job: Job, correlation_id: str | None
) -> tuple[str, EventType, dict[str, Any]]:
    payload = _base_payload(job, EventType.JOB_DEAD_LETTER, correlation_id)
    payload["errorCode"] = job.error_code
    return settings.kafka_topic_dlq, EventType.JOB_DEAD_LETTER, payload
