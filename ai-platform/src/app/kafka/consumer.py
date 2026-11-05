"""Kafka consumer runtime.

Tasarim:
- Otomatik offset commit KAPALI. Offset yalnizca mesaj PostgreSQL'e guvenli
  sekilde islendikten sonra commit edilir.
- Polling (heartbeat/liveness) ile job isleme, sinirli (bounded) bir asyncio
  kuyrugu ile ayrilir; boylece uzun Ollama cagrisi poll akisini durdurmaz.
- Kuyruk dolunca partition pause/resume ile backpressure uygulanir.
- Offset'ler partition basina SIRALI (contiguous) commit edilir; yarim kalan bir
  offset'in otesine gecilmez, boylece worker DB commit sonrasi/Kafka commit
  oncesi coktuguinde mesaj guvenle yeniden islenir (at-least-once + idempotent).
- Graceful shutdown: yeni mesaj alimi durdurulur, is uzerindeki gorevler
  tamamlanir, son commit yapilir, consumer kapatilir.
"""

from __future__ import annotations

import asyncio
import contextlib
import threading
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from confluent_kafka import Consumer, KafkaError, TopicPartition

from app.config import Settings
from app.logging import get_logger
from app.metrics import kafka_rebalance_total, worker_queue_capacity, worker_queue_fill

logger = get_logger(__name__)


@dataclass(frozen=True)
class ConsumerMessage:
    topic: str
    partition: int
    offset: int
    key: str | None
    value: bytes


class _PartitionProgress:
    """Partition basina sirali (contiguous) offset ilerlemesi."""

    def __init__(self, first_offset: int):
        self.committed_through: int = first_offset - 1
        self._done: set[int] = set()

    def complete(self, offset: int) -> None:
        self._done.add(offset)
        while (self.committed_through + 1) in self._done:
            self.committed_through += 1
            self._done.discard(self.committed_through)

    def next_commit_offset(self) -> int:
        return self.committed_through + 1


class OffsetTracker:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._progress: dict[tuple[str, int], _PartitionProgress] = {}

    def note_delivered(self, tp: tuple[str, int], offset: int) -> None:
        with self._lock:
            if tp not in self._progress:
                self._progress[tp] = _PartitionProgress(offset)

    def complete(self, tp: tuple[str, int], offset: int) -> None:
        with self._lock:
            prog = self._progress.get(tp)
            if prog is not None:
                prog.complete(offset)

    def drain_commit_offsets(self) -> list[TopicPartition]:
        with self._lock:
            out: list[TopicPartition] = []
            for (topic, partition), prog in self._progress.items():
                commit_offset = prog.next_commit_offset()
                if commit_offset >= 0:
                    out.append(TopicPartition(topic, partition, commit_offset))
            return out

    def reset(self, tps: list[tuple[str, int]] | None = None) -> None:
        with self._lock:
            if tps is None:
                self._progress.clear()
            else:
                for tp in tps:
                    self._progress.pop(tp, None)


Handler = Callable[[ConsumerMessage], Awaitable[bool]]


class ConsumerRunner:
    """confluent-kafka consumer'i async isleme ile kopruler."""

    def __init__(
        self,
        settings: Settings,
        *,
        topics: list[str],
        handler: Handler,
        concurrency: int,
        queue_size: int,
    ):
        self._settings = settings
        self._topics = topics
        self._handler = handler
        self._concurrency = max(1, concurrency)
        self._queue_size = max(1, queue_size)

        self._consumer = Consumer(
            {
                "bootstrap.servers": settings.kafka_bootstrap_servers,
                "group.id": settings.kafka_consumer_group,
                "enable.auto.commit": False,
                "auto.offset.reset": "earliest",
                "max.poll.interval.ms": settings.kafka_max_poll_interval_ms,
                "session.timeout.ms": settings.kafka_session_timeout_ms,
                "heartbeat.interval.ms": settings.kafka_heartbeat_interval_ms,
                "partition.assignment.strategy": "cooperative-sticky",
                "enable.partition.eof": False,
            }
        )
        self._tracker = OffsetTracker()
        self._stop = threading.Event()
        self._inflight = 0
        self._inflight_lock = threading.Lock()
        self._paused = False
        self._loop: asyncio.AbstractEventLoop | None = None
        self._queue: asyncio.Queue[ConsumerMessage] | None = None
        self._poll_thread: threading.Thread | None = None

    # ---- inflight sayac (poll thread ve async taraf paylasir) ----
    def _inc_inflight(self) -> None:
        with self._inflight_lock:
            self._inflight += 1

    def _dec_inflight(self) -> None:
        with self._inflight_lock:
            self._inflight -= 1

    def _inflight_count(self) -> int:
        with self._inflight_lock:
            return self._inflight

    # ---- rebalance callback'leri ----
    def _on_assign(self, consumer: Consumer, partitions: list[TopicPartition]) -> None:
        # cooperative-sticky protokolunde eager assign() "Erroneous state" verir;
        # yalnizca yeni eklenen partition'lar incremental olarak atanmalidir.
        kafka_rebalance_total.inc()
        logger.info("partition atandi", extra={"count": len(partitions)})
        consumer.incremental_assign(partitions)

    def _on_revoke(self, consumer: Consumer, partitions: list[TopicPartition]) -> None:
        logger.info("partition geri alindi", extra={"count": len(partitions)})
        self._commit_now()
        self._tracker.reset([(tp.topic, tp.partition) for tp in partitions])
        with contextlib.suppress(Exception):
            # cooperative protokolde yalnizca geri alinan partition'lar birakilir.
            consumer.incremental_unassign(partitions)

    def _commit_now(self) -> None:
        offsets = self._tracker.drain_commit_offsets()
        valid = [tp for tp in offsets if tp.offset > 0]
        if valid:
            try:
                self._consumer.commit(offsets=valid, asynchronous=False)
            except Exception as exc:  # noqa: BLE001
                logger.warning("offset commit hatasi", extra={"error": str(exc)})

    # ---- poll thread ----
    def _poll_loop(self) -> None:
        assert self._loop is not None
        assert self._queue is not None
        self._consumer.subscribe(
            self._topics, on_assign=self._on_assign, on_revoke=self._on_revoke
        )
        while not self._stop.is_set():
            self._apply_backpressure()
            msg = self._consumer.poll(0.25)
            self._commit_now()
            if msg is None:
                continue
            err = msg.error()
            if err is not None:
                if err.code() == KafkaError._PARTITION_EOF:
                    continue
                logger.warning("kafka mesaj hatasi", extra={"error": str(err)})
                continue

            raw_key = msg.key()
            cm = ConsumerMessage(
                topic=msg.topic(),
                partition=msg.partition(),
                offset=msg.offset(),
                key=raw_key.decode("utf-8") if raw_key else None,
                value=msg.value() or b"",
            )
            self._tracker.note_delivered((cm.topic, cm.partition), cm.offset)
            self._inc_inflight()
            asyncio.run_coroutine_threadsafe(self._queue.put(cm), self._loop)

        # cikis: son commit
        self._commit_now()

    def _apply_backpressure(self) -> None:
        count = self._inflight_count()
        assignment = self._consumer.assignment()
        if not assignment:
            return
        if not self._paused and count >= self._queue_size:
            self._consumer.pause(assignment)
            self._paused = True
            logger.info("backpressure: partition'lar duraklatildi", extra={"inflight": count})
        elif self._paused and count <= max(1, self._queue_size // 2):
            self._consumer.resume(assignment)
            self._paused = False
            logger.info("backpressure: partition'lar devam ettirildi", extra={"inflight": count})

    # ---- async worker gorevleri ----
    async def _worker(self) -> None:
        assert self._queue is not None
        while True:
            cm = await self._queue.get()
            try:
                worker_queue_fill.set(self._inflight_count())
                ok = await self._handler(cm)
                if ok:
                    self._tracker.complete((cm.topic, cm.partition), cm.offset)
            except Exception as exc:  # noqa: BLE001
                # Beklenmeyen hata: offset commit EDILMEZ; mesaj yeniden islenir.
                logger.error(
                    "mesaj isleme beklenmeyen hata",
                    extra={"error": str(exc), "partition": cm.partition, "offset": cm.offset},
                )
            finally:
                self._dec_inflight()
                self._queue.task_done()
                worker_queue_fill.set(self._inflight_count())

    async def run(self) -> None:
        self._loop = asyncio.get_running_loop()
        self._queue = asyncio.Queue(maxsize=self._queue_size * 2)
        worker_queue_capacity.set(self._queue_size)

        workers = [asyncio.create_task(self._worker()) for _ in range(self._concurrency)]
        self._poll_thread = threading.Thread(target=self._poll_loop, name="kafka-poll", daemon=True)
        self._poll_thread.start()

        stop_waiter = asyncio.get_running_loop().create_future()
        self._stop_waiter = stop_waiter
        try:
            await stop_waiter
        finally:
            # graceful drain
            if self._queue is not None:
                await self._queue.join()
            for w in workers:
                w.cancel()
            await asyncio.gather(*workers, return_exceptions=True)
            if self._poll_thread is not None:
                self._poll_thread.join(timeout=10.0)
            self._consumer.close()

    def stop(self) -> None:
        self._stop.set()
        loop = self._loop
        waiter = getattr(self, "_stop_waiter", None)
        if loop is not None and waiter is not None and not waiter.done():
            loop.call_soon_threadsafe(waiter.set_result, None)
