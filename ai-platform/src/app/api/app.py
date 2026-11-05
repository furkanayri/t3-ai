"""FastAPI uygulama factory ve lifespan.

Lifespan icinde uzun omurlu kaynaklar (DB engine + baglanti havuzu) olusturulur
ve kapanista duzgun kapatilir. API dogrudan Kafka'ya yazmaz; yalnizca PostgreSQL
(job + outbox) ile konusur.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError as FastAPIRequestValidationError
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.api.middleware import (
    CorrelationIdMiddleware,
    MetricsMiddleware,
    RequestSizeLimitMiddleware,
    install_exception_handlers,
)
from app.api.routes_dashboard import router as dashboard_router
from app.api.routes_health import router as health_router
from app.api.routes_jobs import router as jobs_router
from app.api.routes_metrics import router as metrics_router
from app.config import Settings, get_settings
from app.db.engine import Database
from app.logging import configure_logging, get_logger
from app.services.jobs import JobService

logger = get_logger(__name__)


def create_app(settings: Settings | None = None, database: Database | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        owns_db = database is None
        db = database or Database(settings)
        app.state.settings = settings
        app.state.db = db
        app.state.job_service = JobService(settings, db)
        logger.info("LLM API baslatildi", extra={"env": settings.app_env})
        try:
            yield
        finally:
            if owns_db:
                await db.dispose()
            logger.info("LLM API kapatildi")

    app = FastAPI(
        title="Merkezi LLM Platformu API",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(MetricsMiddleware)
    app.add_middleware(RequestSizeLimitMiddleware, max_bytes=settings.max_request_bytes)
    app.add_middleware(CorrelationIdMiddleware, settings=settings)

    install_exception_handlers(app)

    @app.exception_handler(FastAPIRequestValidationError)
    async def _validation_handler(
        request: Request, exc: FastAPIRequestValidationError
    ) -> JSONResponse:
        # Girdi degerlerini (input) ECHO ETMEDEN yalnizca alan/konum ve mesaj.
        fields = []
        for err in exc.errors():
            loc = ".".join(str(p) for p in err.get("loc", ()) if p != "body")
            fields.append({"field": loc, "message": err.get("msg", "gecersiz")})
        cid = getattr(request.state, "correlation_id", None)
        return JSONResponse(
            status_code=422,
            content={
                "code": "invalid_request",
                "message": "Istek dogrulamasi basarisiz",
                "fields": fields,
                "correlationId": cid,
            },
        )

    app.include_router(jobs_router)
    app.include_router(health_router)
    app.include_router(metrics_router)
    app.include_router(dashboard_router)
    return app
