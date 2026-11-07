"""Is dagitim katmani (RabbitMQ KARAR VERILDI; varsayilan in-memory kuyruk).

Mesajda yalnizca job_id + stage + referanslar akar (payload asla kuyruga girmez).
Retry/lease kaynak-dogrulugu Postgres outbox + reconcile'dadir; dispatcher
yalnizca "su job'in su asamasi hazir" ipucudur. Broker mesaji kaybolsa bile
reconcile toparlar.
"""

import collections
import threading


class TenantFairDispatcher:
    """Tenant-fair in-process kuyruk: tek tenant'in patlamasi digerlerini ac
    birakamaz (ozellikle GPU tier). Smooth Weighted Round-Robin (SWRR, nginx
    algoritmasi) ile tenant'lar agirliklarina gore serpistirilir; her tenant icin
    FIFO korunur. tenant agirligi tenant_config'ten gelir.

    Prod'da bu, RabbitMQ'da per-tenant kuyruk + agirlikli tuketim veya priority
    ile karsilanir; dispatcher yalniz "su job hazir" ipucu, kaynak-dogruluk
    Postgres outbox + reconcile'dadir (bkz. RabbitDispatcher)."""

    def __init__(self):
        self._buckets = collections.OrderedDict()  # tenant_id -> deque
        self._current = collections.defaultdict(int)  # SWRR gecici agirlik
        self._lock = threading.Lock()

    @staticmethod
    def _weight(tenant_id):
        from platform_core import tenants

        return max(1, tenants.config_for(tenant_id)["weight"])

    def publish(self, message):
        with self._lock:
            tenant = message["tenant_id"]
            self._buckets.setdefault(tenant, collections.deque()).append(dict(message))

    def pop(self):
        with self._lock:
            active = [t for t, queue in self._buckets.items() if queue]
            if not active:
                return None
            total = sum(self._weight(t) for t in active)
            best = None
            for tenant in active:
                self._current[tenant] += self._weight(tenant)
                if best is None or self._current[tenant] > self._current[best]:
                    best = tenant
            self._current[best] -= total
            return self._buckets[best].popleft()

    def __len__(self):
        with self._lock:
            return sum(len(queue) for queue in self._buckets.values())

    def consume_all(self, handler, max_messages=1000):
        processed = 0
        while processed < max_messages:
            message = self.pop()
            if message is None:
                return processed
            handler(message)
            processed += 1
        raise RuntimeError("dispatch drain limiti asildi (olasi dongu)")


class InMemoryDispatcher:
    """Surec-ici FIFO kuyruk (dev/test + tek-worker uctan uca)."""

    def __init__(self):
        self._queue = collections.deque()
        self._lock = threading.Lock()

    def publish(self, message):
        with self._lock:
            self._queue.append(dict(message))

    def pop(self):
        with self._lock:
            return self._queue.popleft() if self._queue else None

    def __len__(self):
        with self._lock:
            return len(self._queue)

    def consume_all(self, handler, max_messages=1000):
        """Kuyrugu bosaltana kadar isler. handler yeni asamalar publish edebilir;
        onlar da ayni drain icinde islenir. max_messages sonsuz dongu korumasi."""
        processed = 0
        while processed < max_messages:
            message = self.pop()
            if message is None:
                return processed
            handler(message)
            processed += 1
        raise RuntimeError("dispatch drain limiti asildi (olasi dongu)")


class RabbitDispatcher:
    """RabbitMQ quorum-queue dikisi (prod). pika gerektirir; testlerde kullanilmaz."""

    def __init__(self, url, queue="media.jobs"):
        import pika  # noqa: F401

        self._url = url
        self._queue = queue

    def publish(self, message):
        import json

        import pika

        connection = pika.BlockingConnection(pika.URLParameters(self._url))
        try:
            channel = connection.channel()
            channel.queue_declare(queue=self._queue, durable=True, arguments={"x-queue-type": "quorum"})
            channel.basic_publish(
                exchange="",
                routing_key=self._queue,
                body=json.dumps(message).encode(),
                properties=pika.BasicProperties(delivery_mode=2),
            )
        finally:
            connection.close()


_dispatcher = None
_lock = threading.Lock()


def get_dispatcher():
    global _dispatcher
    with _lock:
        if _dispatcher is None:
            _dispatcher = InMemoryDispatcher()
        return _dispatcher


def set_dispatcher(dispatcher):
    global _dispatcher
    with _lock:
        _dispatcher = dispatcher
    return dispatcher
