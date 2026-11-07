"""Dev/test bootstrap: keyring ve servis/tenant token dosyalarini uretir.

Prod'da `KEYRING_FILE` ve `SERVICE_TOKENS_FILE` ortam degiskenleriyle gercek
dosyalar verilir ve bu modul onlara dokunmaz. Dosya yolu bos oldugunda (dev/test)
`.instance/` altinda deterministik olmayan rastgele anahtarlarla uretilir.
"""

import base64
import json
import os
import secrets

from config.settings import INSTANCE_DIR, settings

ROLES = ("orchestration", "fetch", "extraction", "ocr", "evaluation", "dispatcher")
DEV_TENANT = "00000000-0000-0000-0000-000000000001"


def _b64(raw):
    return base64.b64encode(raw).decode("ascii")


def ensure_keyring():
    """crypto.keys() ile uyumlu bir keyring saglar; yolu settings'e yazar."""
    if settings.KEYRING_FILE and os.path.exists(settings.KEYRING_FILE):
        return settings.KEYRING_FILE
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    path = INSTANCE_DIR / "keyring.json"
    if not path.exists():
        payload = {
            "active": "1",
            "keys": {"1": _b64(secrets.token_bytes(32))},
            "search_key": _b64(secrets.token_bytes(32)),
        }
        path.write_text(json.dumps(payload), encoding="utf-8")
    settings.KEYRING_FILE = str(path)
    return settings.KEYRING_FILE


def ensure_tokens():
    """Servis (rol->token) ve tenant (token->tenant_id) token dosyasini saglar."""
    if settings.SERVICE_TOKENS_FILE and os.path.exists(settings.SERVICE_TOKENS_FILE):
        return load_tokens()
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    path = INSTANCE_DIR / "tokens.json"
    if not path.exists():
        payload = {
            "roles": {role: secrets.token_urlsafe(32) for role in ROLES},
            "tenants": {secrets.token_urlsafe(32): DEV_TENANT},
            # tenant_id -> kota + webhook config (bos/eksik alanlar settings
            # varsayilanlarina duser; bkz. platform_core.tenants).
            "tenant_config": {
                DEV_TENANT: {
                    "concurrency": settings.DEFAULT_TENANT_CONCURRENCY,
                    "daily": settings.DEFAULT_TENANT_DAILY,
                    "weight": settings.DEFAULT_TENANT_WEIGHT,
                    "webhook_url": "",
                    "webhook_secret": secrets.token_urlsafe(32),
                }
            },
        }
        path.write_text(json.dumps(payload), encoding="utf-8")
    settings.SERVICE_TOKENS_FILE = str(path)
    return load_tokens()


def load_tokens():
    with open(settings.SERVICE_TOKENS_FILE, encoding="utf-8") as handle:
        data = json.load(handle)
    data.setdefault("roles", {})
    data.setdefault("tenants", {})
    data.setdefault("tenant_config", {})
    return data


def ensure_all():
    ensure_keyring()
    return ensure_tokens()
