"""API anahtari uretimi ve dogrulamasi.

Anahtar formati: ``<key_id>.<secret>``

- ``key_id``: api_clients tablosundaki kaydin UUID'si (hex, tiresiz).
- ``secret``: rastgele uretilen gizli kisim. Veritabaninda SAKLANMAZ.

Veritabaninda yalnizca ``HMAC-SHA256(secret, API_KEY_HMAC_SECRET)`` hex degeri
tutulur. Dogrulama sabit zamanli karsilastirma (``hmac.compare_digest``) ile
yapilir.
"""

from __future__ import annotations

import hmac
import secrets
import uuid
from dataclasses import dataclass
from hashlib import sha256


@dataclass(frozen=True)
class GeneratedApiKey:
    key_id: uuid.UUID
    secret: str
    secret_hash: str

    @property
    def full_key(self) -> str:
        return format_api_key(self.key_id, self.secret)


def generate_secret(num_bytes: int = 32) -> str:
    return secrets.token_urlsafe(num_bytes)


def hash_secret(secret: str, hmac_secret: str) -> str:
    return hmac.new(hmac_secret.encode("utf-8"), secret.encode("utf-8"), sha256).hexdigest()


def format_api_key(key_id: uuid.UUID, secret: str) -> str:
    return f"{key_id.hex}.{secret}"


def generate_api_key(hmac_secret: str, *, key_id: uuid.UUID | None = None) -> GeneratedApiKey:
    kid = key_id or uuid.uuid4()
    secret = generate_secret()
    return GeneratedApiKey(key_id=kid, secret=secret, secret_hash=hash_secret(secret, hmac_secret))


def parse_api_key(raw: str) -> tuple[uuid.UUID, str]:
    """``key_id.secret`` degerini ayristirir. Gecersizse ValueError firlatir."""

    raw = raw.strip()
    if "." not in raw:
        raise ValueError("API anahtari formati gecersiz")
    key_part, _, secret = raw.partition(".")
    if not key_part or not secret:
        raise ValueError("API anahtari formati gecersiz")
    try:
        key_id = uuid.UUID(key_part)
    except ValueError as exc:
        raise ValueError("API anahtari key_id kismi gecersiz") from exc
    return key_id, secret


def verify_secret(secret: str, stored_hash: str, hmac_secret: str) -> bool:
    return hmac.compare_digest(hash_secret(secret, hmac_secret), stored_hash)
