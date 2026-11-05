"""Testlerde kullanilan sahte (fake) bilesenler."""

from __future__ import annotations

from collections.abc import Iterable


class FakeProducer:
    """KafkaProducer arayuzunu taklit eder (gercek Kafka'ya baglanmaz).

    produce_batch: records = [(topic, key, value, msg_id), ...]
    Donus: msg_id -> hata mesaji (None = basarili).
    """

    def __init__(
        self, *, fail_all: bool = False, fail_ids: Iterable[str] | None = None
    ) -> None:
        self.fail_all = fail_all
        self.fail_ids = set(fail_ids or [])
        self.sent: list[tuple[str, str, bytes, str]] = []
        self.closed = False

    def produce_batch(
        self, records: list[tuple[str, str, bytes, str]]
    ) -> dict[str, str | None]:
        results: dict[str, str | None] = {}
        for topic, key, value, mid in records:
            if self.fail_all or mid in self.fail_ids:
                results[mid] = "sahte teslim hatasi"
            else:
                self.sent.append((topic, key, value, mid))
                results[mid] = None
        return results

    def close(self) -> None:
        self.closed = True

    @property
    def sent_topics(self) -> list[str]:
        return [topic for topic, _k, _v, _m in self.sent]
