"""Retry Dispatcher.

- Suresi gelen RETRY job'larini bulur ve yeniden QUEUED yapar.
- Lease suresi dolmus RUNNING job'larini kurtarir.
- Job'i atomik olarak (FOR UPDATE SKIP LOCKED ile kilitli) gunceller ve ayni
  transaction'da outbox kaydi olusturur.
- Maksimum denemeyi asan job'i DEAD_LETTER yapar ve DLQ olayini outbox'a yazar.

Retry beklerken Kafka consumer'i ASLA sleep ile bloke edilmez; bekleme suresi
PostgreSQL'de (next_retry_at) saklanir ve bu ayri process tarafindan islenir.
"""

from __future__ import annotations

import asyncio
import contextlib

from app.config import Settings
from app.db import repositories as repo
from app.db.engine import Database
from app.domain import events
from app.domain.enums import ErrorCode
from app.logging import get_logger
from app.metrics import jobs_dlq_total, jobs_retried_total

logger = get_logger(__name__)


class RetryDispatcher:
    def __init__(self, settings: Settings, db: Database):
        self._settings = settings
        self._db = db
        self._stop = asyncio.Event()

    async def run_once(self) -> int:
        processed = 0
        processed += await self._dispatch_due_retries()
        processed += await self._recover_expired_leases()
        return processed

    async def _dispatch_due_retries(self) -> int:
        batch = self._settings.outbox_batch_size
        count = 0
        async with self._db.begin() as session:
            jobs = await repo.fetch_due_retry_jobs(session, batch)
            for job in jobs:
                repo.requeue_locked_job(job)
                topic, event_type, payload = events.requested_event(self._settings, job, None)
                repo.add_outbox(
                    session,
                    job_id=job.id,
                    topic=topic,
                    event_type=event_type.value,
                    partition_key=str(job.id),
                    payload=payload,
                )
                count += 1
        if count:
            jobs_retried_total.inc(count)
            logger.info("due RETRY job'lari yeniden kuyruga alindi", extra={"count": count})
        return count

    async def _recover_expired_leases(self) -> int:
        batch = self._settings.outbox_batch_size
        requeued = 0
        dead = 0
        async with self._db.begin() as session:
            jobs = await repo.fetch_expired_running_jobs(session, batch)
            for job in jobs:
                if job.attempt >= self._settings.retry_max_attempts:
                    repo.dead_letter_locked_job(
                        job,
                        ErrorCode.INTERNAL.value,
                        "Lease suresi doldu ve maksimum deneme asildi",
                    )
                    topic, event_type, payload = events.dead_letter_event(
                        self._settings, job, None
                    )
                    dead += 1
                else:
                    repo.requeue_locked_job(job)
                    topic, event_type, payload = events.requested_event(self._settings, job, None)
                    requeued += 1
                repo.add_outbox(
                    session,
                    job_id=job.id,
                    topic=topic,
                    event_type=event_type.value,
                    partition_key=str(job.id),
                    payload=payload,
                )
        if requeued:
            jobs_retried_total.inc(requeued)
            logger.info("lease'i dolmus job'lar kurtarildi", extra={"count": requeued})
        if dead:
            jobs_dlq_total.inc(dead)
            logger.warning("lease kurtarmada DLQ'ya alinan job", extra={"count": dead})
        return requeued + dead

    async def run(self) -> None:
        logger.info("retry dispatcher basladi")
        while not self._stop.is_set():
            try:
                await self.run_once()
            except Exception as exc:  # noqa: BLE001
                logger.error("retry dispatcher dongu hatasi", extra={"error": str(exc)})
            await self._sleep(self._settings.retry_dispatcher_poll_interval_seconds)
        logger.info("retry dispatcher durdu")

    async def _sleep(self, seconds: float) -> None:
        with contextlib.suppress(TimeoutError):
            await asyncio.wait_for(self._stop.wait(), timeout=seconds)

    def stop(self) -> None:
        self._stop.set()
