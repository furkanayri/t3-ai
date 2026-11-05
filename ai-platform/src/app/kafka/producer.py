"""Uzun omurlu, idempotent Kafka producer.

Yalnizca Outbox Publisher tarafindan kullanilir (API dogrudan Kafka'ya yazmaz).
acks=all + enable.idempotence ile veri guvenligi onceliklidir; linger/batch/
compression ile makul performans saglanir.
"""

from __future__ import annotations

from confluent_kafka import Producer

from app.config import Settings
from app.logging import get_logger

logger = get_logger(__name__)


class KafkaProducer:
    def __init__(self, settings: Settings):
        self._producer = Producer(
            {
                "bootstrap.servers": settings.kafka_bootstrap_servers,
                "enable.idempotence": True,
                "acks": "all",
                "compression.type": "lz4",
                "linger.ms": 20,
                "batch.num.messages": 10000,
                "max.in.flight.requests.per.connection": 5,
                "message.send.max.retries": 1000000,
                "delivery.timeout.ms": 120000,
                "client.id": "ai-platform-outbox",
            }
        )

    def produce_batch(
        self, records: list[tuple[str, str, bytes, str]]
    ) -> dict[str, str | None]:
        """Kayit listesini (topic, key, value, msg_id) uretir ve ack bekler.

        Donus: msg_id -> hata mesaji (None = basarili). Eksik msg_id'ler teslim
        edilmemis sayilir.
        """

        results: dict[str, str | None] = {}

        def make_cb(mid: str):  # type: ignore[no-untyped-def]
            def _cb(err: object, _msg: object) -> None:
                results[mid] = str(err) if err is not None else None

            return _cb

        for topic, key, value, mid in records:
            self._producer.produce(topic, key=key, value=value, on_delivery=make_cb(mid))

        remaining = self._producer.flush(30.0)
        if remaining > 0:
            logger.warning("kafka flush zaman asimi", extra={"remaining": remaining})
        return results

    def close(self) -> None:
        self._producer.flush(10.0)
