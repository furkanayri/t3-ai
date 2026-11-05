"""AI Worker process giris noktasi."""

from __future__ import annotations

import asyncio

from app.config import get_settings
from app.db.engine import Database
from app.entrypoints._common import (
    configure_event_loop_policy,
    install_signal_handlers,
    make_worker_id,
    start_metrics_server,
    wait_and_ensure_topics,
)
from app.kafka.consumer import ConsumerRunner
from app.llm.ollama import build_model_client
from app.logging import configure_logging, get_logger
from app.services.worker import JobProcessor

logger = get_logger(__name__)


async def _run() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    start_metrics_server(settings)
    wait_and_ensure_topics(settings)

    db = Database(settings)
    model = build_model_client(settings)
    if settings.ollama_warmup:
        await model.warmup()

    worker_id = make_worker_id()
    processor = JobProcessor(settings, db, model, worker_id=worker_id)
    runner = ConsumerRunner(
        settings,
        topics=[settings.kafka_topic_requested],
        handler=processor.handle,
        concurrency=settings.max_concurrent_inference,
        queue_size=settings.worker_internal_queue_size,
    )

    install_signal_handlers(runner.stop)
    logger.info("AI worker basladi", extra={"worker_id": worker_id})
    try:
        await runner.run()
    finally:
        await model.aclose()
        await db.dispose()
        logger.info("AI worker durdu")


def main() -> None:
    configure_event_loop_policy()
    asyncio.run(_run())


if __name__ == "__main__":
    main()
