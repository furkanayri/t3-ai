"""Token kimlik dogrulama (hmac.compare_digest) — servis (rol) + tenant.

Servis token'lari worker rollerine (orchestration/extraction/evaluation/ocr/...),
tenant token'lari tenant_id'ye eslenir. Token dosyasi bootstrap ile saglanir
(prod'da SERVICE_TOKENS_FILE env). Zamanlama-guvenli karsilastirma kullanilir.
"""

import hmac

from fastapi import Header, HTTPException

from platform_core import bootstrap, tenants

_tokens = None


def tokens():
    global _tokens
    if _tokens is None:
        _tokens = bootstrap.ensure_tokens()
    return _tokens


def reload_tokens():
    global _tokens
    _tokens = None
    tenants.reload()
    return tokens()


def _bearer(authorization):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN"})
    return authorization[len("Bearer ") :]


def service_role(authorization: str = Header(default="")):
    """Gecerli servis token'i -> worker rolu. Aksi halde 403."""
    token = _bearer(authorization)
    for role, expected in tokens()["roles"].items():
        if hmac.compare_digest(token, expected):
            return role
    raise HTTPException(status_code=403, detail={"code": "FORBIDDEN"})


def tenant_id(authorization: str = Header(default="")):
    """Gecerli tenant token'i -> tenant_id. Aksi halde 403."""
    token = _bearer(authorization)
    for candidate, identifier in tokens()["tenants"].items():
        if hmac.compare_digest(token, candidate):
            return identifier
    raise HTTPException(status_code=403, detail={"code": "FORBIDDEN"})
