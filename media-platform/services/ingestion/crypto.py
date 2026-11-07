import base64
import hashlib
import hmac
import json
import os
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from config.settings import settings

from platform_core.errors import DomainError


def b64(value):
    return base64.b64encode(value).decode("ascii")


def unb64(value):
    return base64.b64decode(value, validate=True)


def keys():
    return json.loads(Path(settings.KEYRING_FILE).read_text())


def seal(data, context):
    ring = keys()
    version = ring["active"]
    aad = context.encode()
    data_key = AESGCM.generate_key(bit_length=256)
    nonce, wrap_nonce = os.urandom(12), os.urandom(12)
    encrypted = AESGCM(data_key).encrypt(nonce, data, aad)
    wrapped = AESGCM(unb64(ring["keys"][version])).encrypt(wrap_nonce, data_key, aad)
    return encrypted, {
        "v": 1,
        "key_version": version,
        "nonce": b64(nonce),
        "wrap_nonce": b64(wrap_nonce),
        "wrapped_key": b64(wrapped),
    }


def unseal(encrypted, envelope, context):
    try:
        ring = keys()
        aad = context.encode()
        data_key = AESGCM(unb64(ring["keys"][envelope["key_version"]])).decrypt(
            unb64(envelope["wrap_nonce"]), unb64(envelope["wrapped_key"]), aad
        )
        return AESGCM(data_key).decrypt(unb64(envelope["nonce"]), encrypted, aad)
    except Exception:
        raise DomainError("ARTIFACT_INTEGRITY", 422) from None


def seal_value(value, context):
    encrypted, envelope = seal(value.encode(), context)
    return envelope | {"ciphertext": b64(encrypted)}


def open_value(value, context):
    return unseal(unb64(value["ciphertext"]), value, context).decode()


def valid_tckn(value):
    if (
        not isinstance(value, str)
        or len(value) != 11
        or not value.isascii()
        or not value.isdigit()
        or value[0] == "0"
    ):
        return False
    n = [int(c) for c in value]
    return (sum(n[0:9:2]) * 7 - sum(n[1:8:2])) % 10 == n[9] and sum(n[:10]) % 10 == n[10]


def identity_fields(value, application_id):
    if not valid_tckn(value):
        raise DomainError("INVALID_TCKN")
    index_key = unb64(keys()["search_key"])
    return {
        "identity_cipher": seal_value(value, f"identity:{application_id}"),
        "identity_index": hmac.new(index_key, value.encode(), hashlib.sha256).hexdigest(),
        "identity_last4": value[-4:],
    }
