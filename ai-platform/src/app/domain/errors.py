"""Uygulama geneli hata tipleri.

API tarafi hatalari HTTP durum kodu + guvenli (istemciye gosterilebilir) mesaj
tasir; hassas altyapi ayrintilari response'a konmaz. Worker tarafi hatalari ise
bir ErrorCode tasir ve bu kod gecici/kalici ayrimini (retry edilip edilmeyecegi)
belirler.
"""

from __future__ import annotations

from app.domain.enums import ErrorCode, is_transient


class PlatformError(Exception):
    """API katmani icin temel hata (guvenli mesaj + HTTP durum kodu)."""

    status_code: int = 500
    code: str = "internal_error"

    def __init__(self, message: str, *, code: str | None = None, status_code: int | None = None):
        super().__init__(message)
        self.message = message
        if code is not None:
            self.code = code
        if status_code is not None:
            self.status_code = status_code


class AuthError(PlatformError):
    status_code = 401
    code = "unauthorized"


class RequestValidationError(PlatformError):
    status_code = 422
    code = "invalid_request"


class PayloadTooLargeError(PlatformError):
    status_code = 413
    code = "payload_too_large"


class NotFoundError(PlatformError):
    status_code = 404
    code = "not_found"


class BackpressureError(PlatformError):
    """Kapasite sinirlari asildi; istemci sonra tekrar denemelidir."""

    status_code = 429
    code = "capacity_exceeded"

    def __init__(self, message: str, *, retry_after_seconds: int = 1):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds


class ServiceUnavailableError(PlatformError):
    status_code = 503
    code = "service_unavailable"


class ProcessingError(Exception):
    """Worker/dispatcher isleme hatasi. Retry karari error_code'a baglidir."""

    def __init__(self, error_code: ErrorCode, message: str):
        super().__init__(message)
        self.error_code = error_code
        self.message = message

    @property
    def transient(self) -> bool:
        return is_transient(self.error_code)
