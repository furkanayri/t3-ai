"""Transactional outbox publisher entegrasyon testleri (FakeProducer ile)."""

from __future__ import annotations

import uuid

import pytest

from app.db import repositories as repo
from app.db.engine import Database
from app.db.models import OutboxMessage
from app.services.outbox import OutboxPublisher
from tests.conftest import JobFactory, ProjectKeyFactory, make_settings
from tests.fakes import FakeProducer

pytestmark = pytest.mark.integration


async def _add_pending_outbox(database: Database, job_id: uuid.UUID) -> uuid.UUID:
    async with database.session() as s:
        msg = repo.add_outbox(
            s,
            job_id=job_id,
            topic="ai.jobs.requested.v1",
            event_type="job.requested",
            partition_key=str(job_id),
            payload={"jobId": str(job_id), "eventType": "job.requested"},
        )
        await s.flush()
        return msg.id


async def _get_outbox(database: Database, outbox_id: uuid.UUID) -> OutboxMessage:
    async with database.session() as s:
        row = await s.get(OutboxMessage, outbox_id)
        assert row is not None
        return row


async def test_publish_marks_published(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    outbox_id = await _add_pending_outbox(database, job_id)

    producer = FakeProducer()
    publisher = OutboxPublisher(make_settings(), database, producer)  # type: ignore[arg-type]
    count = await publisher.run_once()

    assert count == 1
    assert len(producer.sent) == 1
    row = await _get_outbox(database, outbox_id)
    assert row.status == "PUBLISHED"
    assert row.published_at is not None


async def test_publish_failure_schedules_retry(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    outbox_id = await _add_pending_outbox(database, job_id)

    producer = FakeProducer(fail_all=True)
    publisher = OutboxPublisher(make_settings(), database, producer)  # type: ignore[arg-type]
    count = await publisher.run_once()

    assert count == 0
    row = await _get_outbox(database, outbox_id)
    assert row.status == "PENDING"
    assert row.attempt == 1
    assert row.last_error is not None
    assert row.available_at > repo.utcnow()  # backoff ile ileriye atildi


async def test_publish_reaches_failed_after_max_attempts(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    outbox_id = await _add_pending_outbox(database, job_id)

    producer = FakeProducer(fail_all=True)
    publisher = OutboxPublisher(
        make_settings(outbox_max_attempts=1), database, producer  # type: ignore[arg-type]
    )
    await publisher.run_once()

    row = await _get_outbox(database, outbox_id)
    assert row.status == "FAILED"
    assert row.attempt == 1


async def test_published_rows_not_reprocessed(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    await _add_pending_outbox(database, job_id)

    producer = FakeProducer()
    publisher = OutboxPublisher(make_settings(), database, producer)  # type: ignore[arg-type]
    assert await publisher.run_once() == 1
    # Ikinci calistirmada bekleyen kayit kalmaz.
    assert await publisher.run_once() == 0
    assert len(producer.sent) == 1


async def test_recovery_after_transient_failure(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    outbox_id = await _add_pending_outbox(database, job_id)

    # Once basarisiz, available_at ileri atilir; sonra elle simdiye cekip tekrar yayinla.
    failing = OutboxPublisher(make_settings(), database, FakeProducer(fail_all=True))  # type: ignore[arg-type]
    await failing.run_once()

    async with database.session() as s:
        row = await s.get(OutboxMessage, outbox_id)
        assert row is not None
        row.available_at = repo.utcnow()

    ok_producer = FakeProducer()
    recovering = OutboxPublisher(make_settings(), database, ok_producer)  # type: ignore[arg-type]
    assert await recovering.run_once() == 1
    row2 = await _get_outbox(database, outbox_id)
    assert row2.status == "PUBLISHED"
