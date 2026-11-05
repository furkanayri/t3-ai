"""Outbox Publisher process giris noktasi."""

from __future__ import annotations

import asyncio

from app.config import get_settings
from app.db.engine import Database
from app.entrypoints._common import (
    configure_event_loop_policy,
    install_signal_handlers,
    start_metrics_server,
    wait_and_ensure_topics,
)
from app.kafka.producer import KafkaProducer
from app.logging import configure_logging, get_logger
from app.services.outbox import OutboxPublisher

logger = get_logger(__name__)


async def _run() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    start_metrics_server(settings)
    wait_and_ensure_topics(settings)

    db = Database(settings)
    producer = KafkaProducer(settings)
    publisher = OutboxPublisher(settings, db, producer)

    install_signal_handlers(publisher.stop)
    try:
        await publisher.run()
    finally:
        producer.close()
        await db.dispose()


def main() -> None:
    configure_event_loop_policy()
    asyncio.run(_run())


if __name__ == "__main__":
    main()
