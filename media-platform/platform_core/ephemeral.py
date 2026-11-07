"""Ephemeral (gecici) byte deposu — orijinal belge/video byte'lari KALICI DEGIL.

document_control services/ingestion/ephemeral.py'den portlandi (import'lar:
django.conf.settings -> config.settings; apps.core.errors -> platform_core.errors;
crypto ayni paketten). `EPHEMERAL_REDIS_URL` bos ise surec-ici in-memory TTL
deposu; dolu ise Redis. Veri sealed saklanir; kuyruga yalnizca job_id akar.
"""

import hashlib
import json
import threading
import time
import uuid

from config.settings import settings

from platform_core.errors import DomainError
from services.ingestion.crypto import seal, unseal

_memory = {}
_lock = threading.Lock()


def _identifier(value):
    return str(uuid.UUID(str(value)))


def _key(document_id, kind, job_id=None):
    document_id = _identifier(document_id)
    suffix = f":{_identifier(job_id)}" if job_id else ""
    return f"document:{document_id}:{kind}{suffix}"


def _context(document_id, kind, job_id=None):
    return "ephemeral:" + _key(document_id, kind, job_id)


def _pack(document_id, kind, data, job_id=None):
    if len(data) > settings.MAX_ARTIFACT_BYTES:
        raise DomainError("FILE_TOO_LARGE", 413)
    encrypted, envelope = seal(data, _context(document_id, kind, job_id))
    metadata = envelope | {
        "sha256": hashlib.sha256(data).hexdigest(),
        "size": len(data),
    }
    return json.dumps(metadata, separators=(",", ":")).encode() + b"\n" + encrypted


def _unpack(document_id, kind, payload, job_id=None):
    try:
        raw_metadata, encrypted = payload.split(b"\n", 1)
        metadata = json.loads(raw_metadata)
        data = unseal(encrypted, metadata, _context(document_id, kind, job_id))
        if (
            len(data) != metadata["size"]
            or hashlib.sha256(data).hexdigest() != metadata["sha256"]
        ):
            raise ValueError
        return data
    except DomainError:
        raise
    except Exception:
        raise DomainError("ARTIFACT_INTEGRITY", 422) from None


def _client():
    if not settings.EPHEMERAL_REDIS_URL:
        return None
    import redis

    return redis.Redis.from_url(
        settings.EPHEMERAL_REDIS_URL,
        socket_connect_timeout=3,
        socket_timeout=5,
        decode_responses=False,
    )


def put(document_id, kind, data, job_id=None):
    key = _key(document_id, kind, job_id)
    payload = _pack(document_id, kind, data, job_id)
    client = _client()
    if client is None:
        with _lock:
            _memory[key] = (time.monotonic() + settings.EPHEMERAL_TTL_SECONDS, payload)
        return
    try:
        if not client.set(key, payload, ex=settings.EPHEMERAL_TTL_SECONDS):
            raise DomainError("RAM_STORE_UNAVAILABLE", 503)
    except DomainError:
        raise
    except Exception as error:
        if error.__class__.__name__ in {"OutOfMemoryError", "ResponseError"} and "memory" in str(
            error
        ).lower():
            raise DomainError("RAM_STORE_FULL", 503) from None
        raise DomainError("RAM_STORE_UNAVAILABLE", 503) from None


def read(document_id, kind, job_id=None):
    key = _key(document_id, kind, job_id)
    client = _client()
    if client is None:
        with _lock:
            item = _memory.get(key)
            if item is None or item[0] <= time.monotonic():
                _memory.pop(key, None)
                raise DomainError("DOCUMENT_DATA_EXPIRED", 422)
            payload = item[1]
            _memory[key] = (time.monotonic() + settings.EPHEMERAL_TTL_SECONDS, payload)
    else:
        try:
            payload = client.getex(key, ex=settings.EPHEMERAL_TTL_SECONDS)
        except Exception:
            raise DomainError("RAM_STORE_UNAVAILABLE", 503) from None
        if payload is None:
            raise DomainError("DOCUMENT_DATA_EXPIRED", 422)
    return _unpack(document_id, kind, payload, job_id)


def remove(document_id, kind, job_id=None):
    key = _key(document_id, kind, job_id)
    client = _client()
    if client is None:
        with _lock:
            _memory.pop(key, None)
        return
    try:
        client.delete(key)
    except Exception:
        raise DomainError("RAM_STORE_UNAVAILABLE", 503) from None


def clear_document(document_id):
    prefix = f"document:{_identifier(document_id)}:"
    client = _client()
    if client is None:
        with _lock:
            for key in [key for key in _memory if key.startswith(prefix)]:
                del _memory[key]
        return
    try:
        batch = []
        for key in client.scan_iter(match=prefix + "*", count=100):
            batch.append(key)
            if len(batch) == 100:
                client.delete(*batch)
                batch = []
        if batch:
            client.delete(*batch)
    except Exception:
        raise DomainError("RAM_STORE_UNAVAILABLE", 503) from None


def exists(document_id, kind, job_id=None):
    """Byte'larin silindigini dogrulamak icin (retention testleri)."""
    try:
        read(document_id, kind, job_id)
        return True
    except DomainError:
        return False


def ping():
    client = _client()
    return True if client is None else bool(client.ping())
