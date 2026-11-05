"""Entrypoint'ler icin ortak yardimcilar: metrik sunucusu, sinyaller, worker id."""

from __future__ import annotations

import asyncio
import os
import signal
import socket
import sys
import time
import uuid
from collections.abc import Callable

from app.config import Settings
from app.kafka.admin import ensure_topics
from app.logging import get_logger
from app.metrics import REGISTRY

logger = get_logger(__name__)


def configure_event_loop_policy() -> None:
    """Windows'ta psycopg async icin SelectorEventLoop policy'sini ayarlar.

    Hedef dagitim Linux container'dir; bu yalnizca Docker disinda Windows'ta
    dogrudan calistirma senaryosunu destekler ve Linux'ta etkisizdir.
    """

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def start_metrics_server(settings: Settings) -> None:
    """Non-API process'ler icin Prometheus metrik sunucusunu baslatir."""

    from prometheus_client import start_http_server

    start_http_server(settings.metrics_port, registry=REGISTRY)
    logger.info("metrik sunucusu basladi", extra={"port": settings.metrics_port})


def make_worker_id() -> str:
    return f"{socket.gethostname()}-{os.getpid()}-{uuid.uuid4().hex[:8]}"


def install_signal_handlers(on_stop: Callable[[], None]) -> None:
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, getattr(signal, "SIGTERM", signal.SIGINT)):
        try:
            loop.add_signal_handler(sig, on_stop)
        except (NotImplementedError, RuntimeError):
            signal.signal(sig, lambda *_: on_stop())


def wait_and_ensure_topics(settings: Settings, attempts: int = 30, delay: float = 2.0) -> None:
    last_error: Exception | None = None
    for _ in range(attempts):
        try:
            ensure_topics(settings)
            return
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            logger.info("kafka henuz hazir degil, bekleniyor", extra={"error": str(exc)})
            time.sleep(delay)
    raise RuntimeError(f"Kafka topic'leri hazirlanamadi: {last_error}")
