"""Gercek Ollama + GPU smoke testi.

Yalnizca OLLAMA_SMOKE_HOST ortam degiskeni verildiginde calisir; aksi halde
atlanir. Gercek modeli (OLLAMA_MODEL) tek bir kez cagirir ve uctan uca gercek
inference yolunu dogrular.

Ornek:
    $env:OLLAMA_SMOKE_HOST="http://localhost:11434"
    pytest -m smoke
"""

from __future__ import annotations

import os

import pytest

from app.llm.base import InferenceRequest
from app.llm.ollama import OllamaClient
from tests.conftest import make_settings

pytestmark = pytest.mark.smoke

SMOKE_HOST = os.environ.get("OLLAMA_SMOKE_HOST")


@pytest.mark.skipif(not SMOKE_HOST, reason="OLLAMA_SMOKE_HOST tanimli degil")
async def test_real_ollama_generates_text() -> None:
    settings = make_settings(ollama_host=SMOKE_HOST)
    client = OllamaClient(settings)
    try:
        assert await client.health() is True
        result = await client.generate(
            InferenceRequest(
                messages=[{"role": "user", "content": "Tek kelimeyle: merhaba?"}],
                temperature=0.0,
                max_output_tokens=16,
            )
        )
        assert isinstance(result.text, str)
        assert result.text.strip() != ""
        assert result.duration_ms > 0
    finally:
        await client.aclose()


@pytest.mark.skipif(not SMOKE_HOST, reason="OLLAMA_SMOKE_HOST tanimli degil")
async def test_real_ollama_structured_output() -> None:
    settings = make_settings(ollama_host=SMOKE_HOST)
    client = OllamaClient(settings)
    schema = {
        "type": "object",
        "properties": {"cevap": {"type": "string"}},
        "required": ["cevap"],
    }
    try:
        result = await client.generate(
            InferenceRequest(
                messages=[{"role": "user", "content": "JSON ver: {\"cevap\": \"evet\"}"}],
                temperature=0.0,
                max_output_tokens=64,
                json_schema=schema,
            )
        )
        import json

        parsed = json.loads(result.text)
        assert "cevap" in parsed
    finally:
        await client.aclose()
