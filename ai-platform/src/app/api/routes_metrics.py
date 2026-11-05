"""Prometheus /metrics endpoint'i ve tum process'leri toplayan /metrics/all."""

from __future__ import annotations

import asyncio
import os

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import Response
from prometheus_client import CONTENT_TYPE_LATEST

from app import metrics
from app.db.engine import Database

router = APIRouter(tags=["metrics"])


def _refresh_pool_gauges(request: Request) -> None:
    db: Database = request.app.state.db
    stats = db.pool_stats()
    if "checkedout" in stats:
        metrics.db_pool_connections.labels(state="active").set(stats["checkedout"])
    if "checkedin" in stats:
        metrics.db_pool_connections.labels(state="idle").set(stats["checkedin"])
    if "overflow" in stats:
        metrics.db_pool_connections.labels(state="overflow").set(stats["overflow"])


@router.get("/metrics")
async def prometheus_metrics(request: Request) -> Response:
    # DB pool gauge'larini anlik guncelle.
    _refresh_pool_gauges(request)
    return Response(content=metrics.render(), media_type=CONTENT_TYPE_LATEST)


def _peer_targets(request: Request) -> list[str]:
    """Metriklerini toplayacagimiz diger process'lerin host:port listesi.

    Varsayilan Docker Compose servis adlari; METRICS_PEERS ile override edilebilir
    (virgulle ayrilmis host:port). Docker disinda calistirmada bos birakilabilir.
    """

    env = os.getenv("METRICS_PEERS")
    if env is not None:
        return [p.strip() for p in env.split(",") if p.strip()]
    port = request.app.state.settings.metrics_port
    return [f"ai-worker:{port}", f"outbox-publisher:{port}", f"retry-dispatcher:{port}"]


@router.get("/metrics/all")
async def prometheus_metrics_all(request: Request) -> Response:
    """Bu process + worker/outbox/retry metriklerini tek ciktida birlestirir.

    Her process kendi bellek alaninda metrik tuttugundan (ayri container'lar),
    tam platform gorunumu icin diger process'lerin /metrics uclari da cekilir.
    Erisilemeyen hedefler sessizce atlanir; en azindan yerel metrikler doner.
    """

    _refresh_pool_gauges(request)
    parts: list[str] = [metrics.render().decode("utf-8")]

    targets = _peer_targets(request)
    if targets:
        async with httpx.AsyncClient(timeout=2.0) as client:
            results = await asyncio.gather(
                *(client.get(f"http://{t}/metrics") for t in targets),
                return_exceptions=True,
            )
        for result in results:
            if isinstance(result, Exception):
                continue
            if result.status_code == 200:
                parts.append(result.text)

    return Response(content="\n".join(parts), media_type=CONTENT_TYPE_LATEST)
