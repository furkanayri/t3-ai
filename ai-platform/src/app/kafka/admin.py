"""Kafka topic'lerini idempotent olarak olusturan yardimci.

init container / init script ve CLI tarafindan kullanilir. Var olan topic'ler
hata olusturmadan atlanir.
"""

from __future__ import annotations

from confluent_kafka.admin import AdminClient, NewTopic

from app.config import Settings
from app.logging import get_logger

logger = get_logger(__name__)


def ensure_topics(settings: Settings, timeout: float = 30.0) -> None:
    admin = AdminClient({"bootstrap.servers": settings.kafka_bootstrap_servers})

    topics = [
        settings.kafka_topic_requested,
        settings.kafka_topic_events,
        settings.kafka_topic_dlq,
    ]
    existing = set(admin.list_topics(timeout=timeout).topics.keys())
    to_create = [
        NewTopic(
            name,
            num_partitions=settings.kafka_topic_partitions,
            replication_factor=settings.kafka_topic_replication_factor,
        )
        for name in topics
        if name not in existing
    ]
    if not to_create:
        logger.info("kafka topic'leri zaten mevcut", extra={"topics": topics})
        return

    futures = admin.create_topics(to_create)
    for name, future in futures.items():
        try:
            future.result(timeout=timeout)
            logger.info("kafka topic olusturuldu", extra={"topic": name})
        except Exception as exc:  # noqa: BLE001 - "zaten var" dahil tum hatalar tolere edilir
            if "already exists" in str(exc).lower():
                logger.info("kafka topic zaten var", extra={"topic": name})
            else:
                logger.error("kafka topic olusturulamadi", extra={"topic": name, "error": str(exc)})
                raise
