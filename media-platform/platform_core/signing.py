"""Webhook imzalama (HMAC-SHA256). Dispatcher imzalar, SDK dogrular.

Imza, ham govde byte'lari uzerinden hesaplanir; karsilastirma zamanlama-guvenli
(compare_digest). Secret tenant_config'ten gelir (platform_core.tenants)."""

import hashlib
import hmac

SIGNATURE_HEADER = "X-Media-Signature"
SCHEME = "sha256"


def sign(secret, body):
    """body: bytes. Doner: 'sha256=<hex>'."""
    if isinstance(secret, str):
        secret = secret.encode("utf-8")
    digest = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return f"{SCHEME}={digest}"


def verify(secret, body, signature):
    if not signature:
        return False
    return hmac.compare_digest(sign(secret, body), signature)
