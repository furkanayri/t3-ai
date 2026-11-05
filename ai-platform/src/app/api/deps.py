"""FastAPI bagimliliklari (dependency injection)."""

from __future__ import annotations

from collections.abc import AsyncIterator

from fastapi import Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.db.engine import Database
from app.domain.errors import AuthError
from app.security.auth import AuthContext, authenticate


def get_settings_dep(request: Request) -> Settings:
    return request.app.state.settings  # type: ignore[no-any-return]


def get_database(request: Request) -> Database:
    return request.app.state.db  # type: ignore[no-any-return]


def get_job_service(request: Request):  # type: ignore[no-untyped-def]
    return request.app.state.job_service


async def get_read_session(request: Request) -> AsyncIterator[AsyncSession]:
    db: Database = request.app.state.db
    async with db.session_factory() as session:
        yield session


def _extract_bearer(authorization: str | None) -> str:
    if not authorization:
        raise AuthError("Authorization header gerekli")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise AuthError("Authorization header formati gecersiz")
    return parts[1].strip()


async def require_auth(
    request: Request,
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings_dep),
) -> AuthContext:
    raw_key = _extract_bearer(authorization)
    db: Database = request.app.state.db
    from app.db.repositories import utcnow

    async with db.session() as session:
        ctx = await authenticate(
            session, raw_key, settings.api_key_hmac_secret, now=utcnow()
        )
    return ctx
