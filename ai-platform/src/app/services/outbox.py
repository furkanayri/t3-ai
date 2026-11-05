"""Transactional outbox publisher.

Yayinlanmayi bekleyen kayitlari batch halinde (FOR UPDATE SKIP LOCKED) alir,
Kafka'ya gonderir, broker ack'ini bekler ve sonuca gore PUBLISHED yapar veya
exponential backoff + jitter ile yeniden dener. Outbox mesajlari tekrar
yayinlanabilir; consumer idempotenttir.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import random
from datetime import timedelta

from app.config import Settings
from app.db import repositories as repo
from app.db.engine import Database
from app.domain.enums import OutboxStatus
from app.kafka.producer import KafkaProducer
from app.logging import get_logger
from app.metrics import outbox_pending

logger = get_logger(__name__)


class OutboxPublisher:
    def __init__(self, settings: Settings, db: Database, producer: KafkaProducer):
        self._settings = settings
        self._db = db
        self._producer = producer
        self._stop = asyncio.Event()

    async def run_once(self) -> int:
        settings = self._settings
        async with self._db.begin() as session:
            messages = await repo.fetch_pending_outbox(session, settings.outbox_batch_size)
            if not messages:
                return 0

            records = [
                (
                    m.topic,
                    m.partition_key,
                    json.dumps(m.payload, ensure_ascii=False).encode("utf-8"),
                    str(m.id),
                )
                for m in messages
            ]
            # Kafka produce + ack bekleme (kisa) ayri thread'de; event loop bloke edilmez.
            results = await asyncio.to_thread(self._producer.produce_batch, records)

            published = 0
            for m in messages:
                error = results.get(str(m.id), "teslim raporu yok")
                if error is None:
                    m.status = OutboxStatus.PUBLISHED.value
                    m.published_at = repo.utcnow()
                    m.last_error = None
                    published += 1
                else:
                    m.attempt += 1
                    m.last_error = error[:500]
                    if m.attempt >= settings.outbox_max_attempts:
                        m.status = OutboxStatus.FAILED.value
                        logger.error(
                            "outbox kaydi kalici basarisiz",
                            extra={"outbox_id": str(m.id), "error": error},
                        )
                    else:
                        m.available_at = repo.utcnow() + timedelta(
                            seconds=self._backoff(m.attempt)
                        )
            return published

    def _backoff(self, attempt: int) -> float:
        base = self._settings.outbox_backoff_base_seconds
        cap = self._settings.outbox_backoff_max_seconds
        delay = min(base * (2 ** (attempt - 1)), cap)
        return float(delay * (0.5 + random.random() / 2.0))  # noqa: S311 - kriptografik degil

    async def run(self) -> None:
        logger.info("outbox publisher basladi")
        while not self._stop.is_set():
            try:
                count = await self.run_once()
                async with self._db.session() as s:
                    outbox_pending.set(await repo.count_outbox_pending(s))
                if count == 0:
                    await self._sleep(self._settings.outbox_poll_interval_seconds)
            except Exception as exc:  # noqa: BLE001
                logger.error("outbox publisher dongu hatasi", extra={"error": str(exc)})
                await self._sleep(min(5.0, self._settings.outbox_poll_interval_seconds * 2))
        logger.info("outbox publisher durdu")

    async def _sleep(self, seconds: float) -> None:
        with contextlib.suppress(TimeoutError):
            await asyncio.wait_for(self._stop.wait(), timeout=seconds)

    def stop(self) -> None:
        self._stop.set()
