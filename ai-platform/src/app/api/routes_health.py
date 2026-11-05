"""Saglik endpoint'leri: liveness ve readiness."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.db.engine import Database
from app.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["health"])


@router.get("/health/live")
async def live() -> dict[str, str]:
    return {"status": "alive"}


@router.get("/health/ready")
async def ready(request: Request) -> JSONResponse:
    db: Database = request.app.state.db
    try:
        await db.healthcheck()
    except Exception as exc:  # noqa: BLE001
        logger.warning("readiness basarisiz", extra={"error": str(exc)})
        return JSONResponse(status_code=503, content={"status": "not_ready", "db": "down"})
    return JSONResponse(status_code=200, content={"status": "ready", "db": "up"})
