"""Calistirma dongusu: surec-ici worker + periyodik bakim.

Faz 2+ worker'i (light.process) tek-worker surec-ici engine cagirir. Bu modul
onu uzun-omurlu bir dongude kosar: kuyrugu bosaltir, aralikli olarak reconcile +
webhook dispatch + retention purge calistirir. Docker'da `python -m workers.runner`
(standalone worker) veya API konteynerinde arka plan thread'i (RUN_INPROC_WORKER)
olarak kullanilir.

Not: in-memory dispatcher surec-ici oldugundan API + arka plan worker ayni
surecte paylasir. Cok-konteynerli olceklemede RabbitMQ consumer dongusu
(RabbitDispatcher) ayrica devreye alinir; kaynak-dogruluk Postgres outbox +
reconcile'da oldugundan model degismez.
"""

import logging
import threading
import time

from config.settings import settings
from orchestrator import engine, results, webhook
from workers import light

log = logging.getLogger("media_platform.runner")

_stop = threading.Event()
_thread = None


def drain():
    """Hazir tum asamalari isler; islenen mesaj sayisini doner."""
    return light.run_until_idle()


def maintenance():
    """Lease toparlama + webhook teslim + suresi dolan sonuc temizligi."""
    for name, action in (
        ("reconcile", engine.reconcile),
        ("webhook", webhook.dispatch_pending),
        ("retention", results.purge_expired),
    ):
        try:
            action()
        except Exception:  # noqa: BLE001 - bakim dongusu patlamamali
            log.exception("maintenance step failed: %s", name)


def _loop():
    last_maintenance = 0.0
    while not _stop.is_set():
        try:
            processed = drain()
        except Exception:  # noqa: BLE001 - tek mesaj hatasi donguyu durdurmaz
            log.exception("drain failed")
            processed = 0
        now = time.monotonic()
        if now - last_maintenance >= settings.MAINTENANCE_INTERVAL_SECONDS:
            maintenance()
            last_maintenance = now
        if not processed:
            _stop.wait(settings.WORKER_IDLE_SLEEP)


def start_background():
    """API konteyneri icin arka plan worker thread'i baslatir (idempotent)."""
    global _thread
    if _thread is not None and _thread.is_alive():
        return _thread
    _stop.clear()
    _thread = threading.Thread(target=_loop, name="inproc-worker", daemon=True)
    _thread.start()
    log.info("in-process worker started")
    return _thread


def stop_background():
    _stop.set()
    if _thread is not None:
        _thread.join(timeout=5)


def run_maintenance_loop():
    """Yalniz bakim dongusu (dispatcher rolu): reconcile + webhook + retention."""
    while not _stop.is_set():
        maintenance()
        _stop.wait(settings.MAINTENANCE_INTERVAL_SECONDS)


def main():
    logging.basicConfig(level=logging.INFO)
    log.info("worker runner starting (standalone)")
    _loop()


if __name__ == "__main__":
    main()
