"""Veri saklama (retention) temizligi.

Saklama suresi dolan terminal durumdaki job'larin hassas payload/result/schema
alanlari NULL yapilir (kayit silinmez; metadata korunur). Sure RETENTION_DAYS
ile ayarlanir; 0 ise temizleme devre disidir.
"""

from __future__ import annotations

import asyncio
import contextlib
from datetime import timedelta

from app.config import Settings
from app.db import repositories as repo
from app.db.engine import Database
from app.logging import get_logger

logger = get_logger(__name__)


class RetentionService:
    def __init__(self, settings: Settings, db: Database):
        self._settings = settings
        self._db = db
        self._stop = asyncio.Event()

    async def run_once(self) -> int:
        if self._settings.retention_days <= 0:
            return 0
        older_than = repo.utcnow() - timedelta(days=self._settings.retention_days)
        async with self._db.session() as session:
            purged = await repo.purge_expired_payloads(session, older_than)
        if purged:
            logger.info("retention: hassas payload temizlendi", extra={"count": purged})
        return purged

    async def run(self) -> None:
        if self._settings.retention_days <= 0:
            logger.info("retention devre disi (RETENTION_DAYS=0)")
            return
        logger.info("retention servisi basladi")
        while not self._stop.is_set():
            try:
                await self.run_once()
            except Exception as exc:  # noqa: BLE001
                logger.error("retention dongu hatasi", extra={"error": str(exc)})
            await self._sleep(self._settings.retention_poll_interval_seconds)

    async def _sleep(self, seconds: float) -> None:
        with contextlib.suppress(TimeoutError):
            await asyncio.wait_for(self._stop.wait(), timeout=seconds)

    def stop(self) -> None:
        self._stop.set()
