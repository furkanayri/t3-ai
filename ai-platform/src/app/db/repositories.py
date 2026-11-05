"""Veritabani erisim fonksiyonlari (sorgular ve atomik durum gecisleri).

Job sahiplenme (claim) ve lease islemleri tek bir atomik UPDATE ile yapilir;
boylece ayni job iki worker tarafindan eszamanli calistirilmaz. Sorgular yalnizca
gereken kolonlari/indeksleri kullanacak sekilde yazilmistir.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ApiClient, Job, JobAttempt, OutboxMessage, Project
from app.domain.enums import JobStatus, OutboxStatus


def utcnow() -> datetime:
    return datetime.now(tz=UTC)


# --------------------------------------------------------------------------
# Kimlik dogrulama
# --------------------------------------------------------------------------
async def get_api_client_with_project(
    session: AsyncSession, key_id: uuid.UUID
) -> tuple[ApiClient, Project] | None:
    stmt = (
        select(ApiClient, Project)
        .join(Project, ApiClient.project_id == Project.id)
        .where(ApiClient.id == key_id)
    )
    row = (await session.execute(stmt)).first()
    if row is None:
        return None
    return row[0], row[1]


async def touch_api_client(session: AsyncSession, key_id: uuid.UUID) -> None:
    await session.execute(
        update(ApiClient).where(ApiClient.id == key_id).values(last_used_at=func.now())
    )


# --------------------------------------------------------------------------
# Job okuma
# --------------------------------------------------------------------------
async def get_job(session: AsyncSession, job_id: uuid.UUID) -> Job | None:
    return await session.get(Job, job_id)


async def get_job_for_project(
    session: AsyncSession, job_id: uuid.UUID, project_id: uuid.UUID
) -> Job | None:
    stmt = select(Job).where(Job.id == job_id, Job.project_id == project_id)
    return (await session.execute(stmt)).scalar_one_or_none()


async def get_job_by_idempotency(
    session: AsyncSession, project_id: uuid.UUID, idempotency_key: str
) -> Job | None:
    stmt = select(Job).where(
        Job.project_id == project_id, Job.idempotency_key == idempotency_key
    )
    return (await session.execute(stmt)).scalar_one_or_none()


# --------------------------------------------------------------------------
# Kapasite sayaclari (backpressure)
# --------------------------------------------------------------------------
_ACTIVE = (JobStatus.QUEUED.value, JobStatus.RUNNING.value, JobStatus.RETRY.value)
_PENDING = (JobStatus.QUEUED.value, JobStatus.RETRY.value)


async def count_project_active(session: AsyncSession, project_id: uuid.UUID) -> int:
    stmt = select(func.count()).where(
        Job.project_id == project_id, Job.status.in_(_ACTIVE)
    )
    return int((await session.execute(stmt)).scalar_one())


async def count_project_pending(session: AsyncSession, project_id: uuid.UUID) -> int:
    stmt = select(func.count()).where(
        Job.project_id == project_id, Job.status.in_(_PENDING)
    )
    return int((await session.execute(stmt)).scalar_one())


async def count_global_pending(session: AsyncSession) -> int:
    stmt = select(func.count()).where(Job.status.in_(_PENDING))
    return int((await session.execute(stmt)).scalar_one())


async def count_outbox_pending(session: AsyncSession) -> int:
    stmt = select(func.count()).where(OutboxMessage.status == OutboxStatus.PENDING.value)
    return int((await session.execute(stmt)).scalar_one())


# --------------------------------------------------------------------------
# Atomik job sahiplenme (claim) ve lease
# --------------------------------------------------------------------------
async def claim_job(
    session: AsyncSession, job_id: uuid.UUID, worker_id: str, lease_seconds: int
) -> Job | None:
    """QUEUED/RETRY durumundaki job'i atomik olarak RUNNING yapar.

    Zaten RUNNING (gecerli lease) veya terminal durumdaki job'lar icin None
    doner; boylece ayni is iki kez calistirilmaz.
    """

    stmt = (
        update(Job)
        .where(
            Job.id == job_id,
            Job.status.in_((JobStatus.QUEUED.value, JobStatus.RETRY.value)),
        )
        .values(
            status=JobStatus.RUNNING.value,
            worker_id=worker_id,
            lease_until=func.now() + timedelta(seconds=lease_seconds),
            attempt=Job.attempt + 1,
            started_at=func.coalesce(Job.started_at, func.now()),
            next_retry_at=None,
            updated_at=func.now(),
        )
        .returning(Job.id)
    )
    claimed = (await session.execute(stmt)).scalar_one_or_none()
    if claimed is None:
        return None
    return await session.get(Job, job_id)


async def renew_lease(
    session: AsyncSession, job_id: uuid.UUID, worker_id: str, lease_seconds: int
) -> bool:
    stmt = (
        update(Job)
        .where(
            Job.id == job_id,
            Job.worker_id == worker_id,
            Job.status == JobStatus.RUNNING.value,
        )
        .values(lease_until=func.now() + timedelta(seconds=lease_seconds), updated_at=func.now())
    )
    result = await session.execute(stmt)
    return (result.rowcount or 0) > 0


# --------------------------------------------------------------------------
# Retry dispatcher sorgulari (FOR UPDATE SKIP LOCKED)
# --------------------------------------------------------------------------
async def fetch_due_retry_jobs(session: AsyncSession, limit: int) -> list[Job]:
    stmt = (
        select(Job)
        .where(Job.status == JobStatus.RETRY.value, Job.next_retry_at <= func.now())
        .order_by(Job.next_retry_at)
        .limit(limit)
        .with_for_update(skip_locked=True)
    )
    return list((await session.execute(stmt)).scalars().all())


async def fetch_expired_running_jobs(session: AsyncSession, limit: int) -> list[Job]:
    stmt = (
        select(Job)
        .where(Job.status == JobStatus.RUNNING.value, Job.lease_until < func.now())
        .order_by(Job.lease_until)
        .limit(limit)
        .with_for_update(skip_locked=True)
    )
    return list((await session.execute(stmt)).scalars().all())


# --------------------------------------------------------------------------
# Job yazma islemleri (ORM nesnesi uzerinde; commit cagiran tarafta)
# --------------------------------------------------------------------------
def add_attempt(session: AsyncSession, job: Job, worker_id: str) -> JobAttempt:
    attempt = JobAttempt(
        job_id=job.id,
        attempt_number=job.attempt,
        worker_id=worker_id,
    )
    session.add(attempt)
    return attempt


def add_outbox(
    session: AsyncSession,
    *,
    job_id: uuid.UUID | None,
    topic: str,
    event_type: str,
    partition_key: str,
    payload: dict[str, Any],
    event_version: str = "1",
    available_at: datetime | None = None,
) -> OutboxMessage:
    msg = OutboxMessage(
        job_id=job_id,
        topic=topic,
        event_type=event_type,
        event_version=event_version,
        partition_key=partition_key,
        payload=payload,
        status=OutboxStatus.PENDING.value,
        available_at=available_at or utcnow(),
    )
    session.add(msg)
    return msg


# --------------------------------------------------------------------------
# Outbox publisher sorgulari
# --------------------------------------------------------------------------
async def fetch_pending_outbox(session: AsyncSession, limit: int) -> list[OutboxMessage]:
    stmt = (
        select(OutboxMessage)
        .where(
            OutboxMessage.status == OutboxStatus.PENDING.value,
            OutboxMessage.available_at <= func.now(),
        )
        .order_by(OutboxMessage.available_at)
        .limit(limit)
        .with_for_update(skip_locked=True)
    )
    return list((await session.execute(stmt)).scalars().all())


# --------------------------------------------------------------------------
# Retention / temizlik
# --------------------------------------------------------------------------
async def purge_expired_payloads(session: AsyncSession, older_than: datetime) -> int:
    """Terminal durumdaki eski job'larin hassas payload/result alanlarini temizler.

    Kayitlar silinmez; yalnizca request_payload/result/response_schema NULL yapilir
    ve purged_at isaretlenir. Boylece metadata (durum, token, sure) korunur.
    """

    stmt = (
        update(Job)
        .where(
            Job.created_at < older_than,
            Job.purged_at.is_(None),
            Job.status.in_(
                (
                    JobStatus.COMPLETED.value,
                    JobStatus.FAILED.value,
                    JobStatus.DEAD_LETTER.value,
                )
            ),
        )
        .values(
            request_payload=None,
            result=None,
            response_schema=None,
            purged_at=func.now(),
        )
    )
    result = await session.execute(stmt)
    return result.rowcount or 0


async def complete_job(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    worker_id: str,
    result: dict[str, Any],
    prompt_tokens: int | None,
    completion_tokens: int | None,
    duration_ms: int | None,
) -> bool:
    """Yalnizca job hala bu worker'in sahipligindeki RUNNING durumundaysa tamamlar."""

    stmt = (
        update(Job)
        .where(
            Job.id == job_id,
            Job.worker_id == worker_id,
            Job.status == JobStatus.RUNNING.value,
        )
        .values(
            status=JobStatus.COMPLETED.value,
            result=result,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            duration_ms=duration_ms,
            error_code=None,
            error_message=None,
            lease_until=None,
            finished_at=func.now(),
            updated_at=func.now(),
        )
    )
    return ((await session.execute(stmt)).rowcount or 0) > 0


async def mark_retry(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    worker_id: str,
    next_retry_at: datetime,
    error_code: str,
    error_message: str,
) -> bool:
    stmt = (
        update(Job)
        .where(
            Job.id == job_id,
            Job.worker_id == worker_id,
            Job.status == JobStatus.RUNNING.value,
        )
        .values(
            status=JobStatus.RETRY.value,
            next_retry_at=next_retry_at,
            error_code=error_code,
            error_message=error_message,
            worker_id=None,
            lease_until=None,
            updated_at=func.now(),
        )
    )
    return ((await session.execute(stmt)).rowcount or 0) > 0


async def mark_terminal_failure(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    worker_id: str,
    status: JobStatus,
    error_code: str,
    error_message: str,
) -> bool:
    stmt = (
        update(Job)
        .where(
            Job.id == job_id,
            Job.worker_id == worker_id,
            Job.status == JobStatus.RUNNING.value,
        )
        .values(
            status=status.value,
            error_code=error_code,
            error_message=error_message,
            worker_id=None,
            lease_until=None,
            finished_at=func.now(),
            updated_at=func.now(),
        )
    )
    return ((await session.execute(stmt)).rowcount or 0) > 0


async def finish_attempt(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    attempt_number: int,
    outcome: str,
    error_code: str | None = None,
    error_message: str | None = None,
    prompt_tokens: int | None = None,
    completion_tokens: int | None = None,
    duration_ms: int | None = None,
) -> None:
    stmt = (
        update(JobAttempt)
        .where(JobAttempt.job_id == job_id, JobAttempt.attempt_number == attempt_number)
        .values(
            outcome=outcome,
            error_code=error_code,
            error_message=error_message,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            duration_ms=duration_ms,
            finished_at=func.now(),
        )
    )
    await session.execute(stmt)


def requeue_locked_job(job: Job) -> None:
    """Dispatcher tarafindan kilitlenmis (FOR UPDATE) bir job'i QUEUED yapar."""

    job.status = JobStatus.QUEUED.value
    job.worker_id = None
    job.lease_until = None
    job.next_retry_at = None


def dead_letter_locked_job(job: Job, error_code: str, error_message: str) -> None:
    job.status = JobStatus.DEAD_LETTER.value
    job.worker_id = None
    job.lease_until = None
    job.error_code = error_code
    job.error_message = error_message
    job.finished_at = utcnow()


async def ping(session: AsyncSession) -> None:
    await session.execute(text("SELECT 1"))
