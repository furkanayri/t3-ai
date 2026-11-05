"""HTTP middleware: correlation id, istek boyutu limiti, metrik ve guvenli hata."""

from __future__ import annotations

import contextlib
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.config import Settings
from app.domain.errors import PayloadTooLargeError, PlatformError
from app.logging import get_logger, new_correlation_id, set_correlation_id
from app.metrics import api_request_duration_seconds, api_requests_total

logger = get_logger(__name__)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, settings: Settings):
        super().__init__(app)
        self._header = settings.correlation_id_header

    async def dispatch(self, request: Request, call_next):  # type: ignore[no-untyped-def]
        incoming = request.headers.get(self._header)
        cid = incoming or new_correlation_id()
        set_correlation_id(cid)
        request.state.correlation_id = cid
        response = await call_next(request)
        response.headers[self._header] = cid
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, max_bytes: int):
        super().__init__(app)
        self._max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next):  # type: ignore[no-untyped-def]
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                if int(content_length) > self._max_bytes:
                    raise PayloadTooLargeError("Istek boyutu limiti asiyor")
            except ValueError:
                pass
        return await call_next(request)


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):  # type: ignore[no-untyped-def]
        start = time.perf_counter()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        finally:
            # Rota sablonu kullanilir (yuksek cardinality'den kacinmak icin).
            route = request.scope.get("route")
            route_path = getattr(route, "path", None) or request.url.path
            duration = time.perf_counter() - start
            with contextlib.suppress(Exception):
                api_request_duration_seconds.labels(request.method, route_path).observe(duration)
                api_requests_total.labels(request.method, route_path, str(status)).inc()


def install_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(PlatformError)
    async def _platform_error(request: Request, exc: PlatformError) -> JSONResponse:
        cid = getattr(request.state, "correlation_id", None)
        headers = {}
        retry_after = getattr(exc, "retry_after_seconds", None)
        if retry_after is not None:
            headers["Retry-After"] = str(retry_after)
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "message": exc.message, "correlationId": cid},
            headers=headers,
        )

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        cid = getattr(request.state, "correlation_id", None)
        # Hassas altyapi ayrintisi response'a KONMAZ; yalnizca loglanir.
        logger.error("beklenmeyen API hatasi", extra={"error": str(exc), "path": request.url.path})
        return JSONResponse(
            status_code=500,
            content={
                "code": "internal_error",
                "message": "Beklenmeyen bir hata olustu",
                "correlationId": cid,
            },
        )
