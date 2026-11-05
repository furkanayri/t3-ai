"""API anahtari uretim/dogrulama birim testleri."""

from __future__ import annotations

import uuid

import pytest

from app.security.api_key import (
    format_api_key,
    generate_api_key,
    hash_secret,
    parse_api_key,
    verify_secret,
)

HMAC = "birim-test-hmac"


def test_generate_and_verify_roundtrip() -> None:
    gen = generate_api_key(HMAC)
    key_id, secret = parse_api_key(gen.full_key)
    assert key_id == gen.key_id
    assert secret == gen.secret
    assert verify_secret(secret, gen.secret_hash, HMAC)


def test_full_key_format_is_keyid_dot_secret() -> None:
    gen = generate_api_key(HMAC)
    prefix, _, rest = gen.full_key.partition(".")
    assert prefix == gen.key_id.hex
    assert rest == gen.secret
    # secret acik haliyle hash'e esit OLMAMALIDIR (sadece hash saklanir).
    assert gen.secret != gen.secret_hash


def test_wrong_secret_fails_verification() -> None:
    gen = generate_api_key(HMAC)
    assert not verify_secret("yanlis-secret", gen.secret_hash, HMAC)


def test_wrong_hmac_fails_verification() -> None:
    gen = generate_api_key(HMAC)
    assert not verify_secret(gen.secret, gen.secret_hash, "baska-hmac")


def test_hash_is_deterministic() -> None:
    assert hash_secret("abc", HMAC) == hash_secret("abc", HMAC)
    assert hash_secret("abc", HMAC) != hash_secret("abd", HMAC)


@pytest.mark.parametrize("bad", ["", "nodot", ".", "x.", ".y", "not-a-uuid.secret"])
def test_parse_invalid_raises(bad: str) -> None:
    with pytest.raises(ValueError):
        parse_api_key(bad)


def test_format_api_key_matches_parse() -> None:
    kid = uuid.uuid4()
    full = format_api_key(kid, "s3cr3t")
    parsed_id, parsed_secret = parse_api_key(full)
    assert parsed_id == kid
    assert parsed_secret == "s3cr3t"
