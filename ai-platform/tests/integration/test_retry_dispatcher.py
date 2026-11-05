"""Retry Dispatcher entegrasyon testleri (due retry + lease kurtarma + DLQ)."""

from __future__ import annotations

import uuid
from datetime import timedelta

import pytest
from sqlalchemy import select

from app.db.engine import Database
from app.db.models import OutboxMessage
from app.db.repositories import utcnow
from app.services.retry import RetryDispatcher
from tests.conftest import JobFactory, ProjectKeyFactory, make_settings, read_job

pytestmark = pytest.mark.integration


async def _outbox_for_job(database: Database, job_id: uuid.UUID) -> list[OutboxMessage]:
    async with database.session() as s:
        rows = (
            await s.execute(select(OutboxMessage).where(OutboxMessage.job_id == job_id))
        ).scalars().all()
        return list(rows)


async def test_due_retry_requeued(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(
        project, status="RETRY", attempt=1, next_retry_at=utcnow() - timedelta(seconds=5)
    )

    dispatcher = RetryDispatcher(make_settings(), database)
    processed = await dispatcher.run_once()

    assert processed >= 1
    job = await read_job(database, job_id)
    assert job.status == "QUEUED"
    assert job.next_retry_at is None
    outbox = await _outbox_for_job(database, job_id)
    assert any(m.event_type == "job.requested" for m in outbox)


async def test_future_retry_not_requeued(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(
        project, status="RETRY", attempt=1, next_retry_at=utcnow() + timedelta(minutes=5)
    )

    dispatcher = RetryDispatcher(make_settings(), database)
    await dispatcher.run_once()

    job = await read_job(database, job_id)
    assert job.status == "RETRY"  # henuz zamani gelmedi


async def test_expired_lease_recovered(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(
        project,
        status="RUNNING",
        attempt=1,
        worker_id="olu-worker",
        lease_until=utcnow() - timedelta(seconds=10),
    )

    dispatcher = RetryDispatcher(make_settings(retry_max_attempts=3), database)
    await dispatcher.run_once()

    job = await read_job(database, job_id)
    assert job.status == "QUEUED"
    assert job.worker_id is None
    outbox = await _outbox_for_job(database, job_id)
    assert any(m.event_type == "job.requested" for m in outbox)


async def test_expired_lease_over_max_goes_to_dlq(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(
        project,
        status="RUNNING",
        attempt=3,
        worker_id="olu-worker",
        lease_until=utcnow() - timedelta(seconds=10),
    )

    dispatcher = RetryDispatcher(make_settings(retry_max_attempts=3), database)
    await dispatcher.run_once()

    job = await read_job(database, job_id)
    assert job.status == "DEAD_LETTER"
    outbox = await _outbox_for_job(database, job_id)
    assert any(m.event_type == "job.dead_letter" for m in outbox)


async def test_fresh_lease_not_touched(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(
        project,
        status="RUNNING",
        attempt=1,
        worker_id="canli-worker",
        lease_until=utcnow() + timedelta(minutes=2),
    )

    dispatcher = RetryDispatcher(make_settings(), database)
    await dispatcher.run_once()

    job = await read_job(database, job_id)
    assert job.status == "RUNNING"  # lease hala gecerli
