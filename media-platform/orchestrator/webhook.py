"""Outbox-driven webhook teslim (en-az-bir-kez + HMAC imza + retry/backoff).

Tasarim retention ile uyumlu: webhook govdesi ICERIK TASIMAZ; yalniz event +
referanslar gider. Caller imzayi dogrular ve sonucu authenticated GET /result ile
ceker (delete-on-delivery). Teslim kaydi WebhookDelivery tablosunda; gercek HTTP
cagrisi transport seam'i ile soyutlanir (test sahte transport enjekte eder, prod
httpx kullanir)."""

import json
from datetime import timedelta

from config.settings import settings
from platform_core import signing, tenants
from orchestrator import db
from orchestrator.models import WebhookDelivery, utcnow


def enqueue(sess, asset, job_id, event):
    """Tenant webhook_url tanimli ise bir PENDING teslim kaydi olusturur."""
    cfg = tenants.config_for(asset.tenant_id)
    if not cfg["webhook_url"]:
        return None
    delivery = WebhookDelivery(
        tenant_id=asset.tenant_id,
        asset_id=asset.id,
        job_id=job_id,
        event=event,
        url=cfg["webhook_url"],
    )
    sess.add(delivery)
    return delivery


def _payload(row):
    # Icerik yok; caller GET /result ile ceker.
    return {
        "event": row.event,
        "asset_id": row.asset_id,
        "job_id": row.job_id,
        "tenant_id": row.tenant_id,
        "occurred_at": row.created_at.isoformat() + "Z",
    }


def _http_post(url, body, headers, timeout):
    import httpx

    response = httpx.post(url, content=body, headers=headers, timeout=timeout)
    return response.status_code


def dispatch_pending(transport=None, limit=100):
    """Vakti gelmis PENDING teslimleri gonderir. transport(url, body, headers,
    timeout) -> http status; None ise httpx. Doner: {delivered, failed, retried}."""
    transport = transport or _http_post
    now = utcnow()
    stats = {"delivered": 0, "failed": 0, "retried": 0}
    with db.session() as sess:
        rows = (
            sess.query(WebhookDelivery)
            .filter(WebhookDelivery.status == "PENDING", WebhookDelivery.next_attempt_at <= now)
            .order_by(WebhookDelivery.next_attempt_at.asc())
            .limit(limit)
            .all()
        )
        for row in rows:
            secret = tenants.config_for(row.tenant_id)["webhook_secret"]
            body = json.dumps(_payload(row), separators=(",", ":")).encode("utf-8")
            headers = {
                "Content-Type": "application/json",
                signing.SIGNATURE_HEADER: signing.sign(secret, body),
                "X-Media-Event": row.event,
            }
            ok, error = False, ""
            try:
                status = transport(row.url, body, headers, settings.WEBHOOK_TIMEOUT_SECONDS)
                ok = 200 <= int(status) < 300
                if not ok:
                    error = f"status {status}"
            except Exception as exc:  # noqa: BLE001 - transport hatasi retry'lanir
                error = str(exc)[:256]
            row.attempts += 1
            if ok:
                row.status, row.delivered_at, row.last_error = "DELIVERED", utcnow(), ""
                stats["delivered"] += 1
            elif row.attempts >= settings.WEBHOOK_MAX_ATTEMPTS:
                row.status, row.last_error = "FAILED", error
                stats["failed"] += 1
            else:
                backoff = settings.WEBHOOK_BACKOFF_SECONDS * (2 ** (row.attempts - 1))
                row.next_attempt_at = utcnow() + timedelta(seconds=backoff)
                row.last_error = error
                stats["retried"] += 1
        sess.commit()
    return stats
