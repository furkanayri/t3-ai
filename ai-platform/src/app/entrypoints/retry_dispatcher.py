"""Retry Dispatcher process giris noktasi (retention temizligi dahil)."""

from __future__ import annotations

import asyncio

from app.config import get_settings
from app.db.engine import Database
from app.entrypoints._common import (
    configure_event_loop_policy,
    install_signal_handlers,
    start_metrics_server,
)
from app.logging import configure_logging, get_logger
from app.services.retention import RetentionService
from app.services.retry import RetryDispatcher

logger = get_logger(__name__)


async def _run() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    start_metrics_server(settings)

    db = Database(settings)
    dispatcher = RetryDispatcher(settings, db)
    retention = RetentionService(settings, db)

    def _stop() -> None:
        dispatcher.stop()
        retention.stop()

    install_signal_handlers(_stop)
    logger.info("retry dispatcher + retention basladi")
    try:
        await asyncio.gather(dispatcher.run(), retention.run())
    finally:
        await db.dispose()


def main() -> None:
    configure_event_loop_policy()
    asyncio.run(_run())


if __name__ == "__main__":
    main()
