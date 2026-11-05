"""Canli metrik dashboard sayfasi (/dashboard)."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from app.api.dashboard import DASHBOARD_HTML

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard() -> HTMLResponse:
    """Metrikleri canli izlemek icin bagimsiz HTML sayfasi dondurur."""

    return HTMLResponse(content=DASHBOARD_HTML)
