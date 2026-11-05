"""API anahtari dogrulama ve proje kimligi cozumleme (framework'ten bagimsiz).

Proje kimligi request govdesinden DEGIL, yalnizca API anahtarindan belirlenir.
Disabled, revoke edilmis veya suresi gecmis anahtarlar reddedilir.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.db import repositories as repo
from app.domain.errors import AuthError
from app.security.api_key import parse_api_key, verify_secret


@dataclass(frozen=True)
class AuthContext:
    project_id: uuid.UUID
    project_code: str
    api_client_id: uuid.UUID


async def authenticate(
    session: AsyncSession,
    raw_key: str,
    hmac_secret: str,
    *,
    now: datetime,
    touch: bool = True,
) -> AuthContext:
    try:
        key_id, secret = parse_api_key(raw_key)
    except ValueError as exc:
        raise AuthError("Gecersiz API anahtari") from exc

    found = await repo.get_api_client_with_project(session, key_id)
    if found is None:
        raise AuthError("Gecersiz API anahtari")
    client, project = found

    if not verify_secret(secret, client.secret_hash, hmac_secret):
        raise AuthError("Gecersiz API anahtari")

    if not client.is_active or client.revoked_at is not None:
        raise AuthError("API anahtari devre disi veya iptal edilmis")

    if client.expires_at is not None and client.expires_at <= now:
        raise AuthError("API anahtarinin suresi dolmus")

    if not project.is_active:
        raise AuthError("Proje devre disi")

    if touch:
        await repo.touch_api_client(session, key_id)

    return AuthContext(
        project_id=project.id,
        project_code=project.code,
        api_client_id=client.id,
    )
