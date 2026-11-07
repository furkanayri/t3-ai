"""Webhook imza dogrulama (sunucu tarafiyla ayni sema: HMAC-SHA256, ham govde)."""

import hashlib
import hmac

SIGNATURE_HEADER = "X-Media-Signature"
_SCHEME = "sha256"


def _sign(secret, body):
    if isinstance(secret, str):
        secret = secret.encode("utf-8")
    if isinstance(body, str):
        body = body.encode("utf-8")
    return f"{_SCHEME}={hmac.new(secret, body, hashlib.sha256).hexdigest()}"


def verify_webhook(secret, body, signature):
    """body: webhook POST'unun HAM govdesi (bytes/str). signature: X-Media-Signature.

    Zamanlama-guvenli karsilastirma. Dogruysa True."""
    if not signature:
        return False
    return hmac.compare_digest(_sign(secret, body), signature)
