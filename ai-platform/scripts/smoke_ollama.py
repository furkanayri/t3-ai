"""Gercek Ollama + GPU icin manuel smoke testi.

CI'da CALISTIRILMAZ. Gercek Ollama servisine baglanir ve OLLAMA_MODEL ile kucuk
bir uretim yapar. Ortam degiskenlerini (.env) kullanir.

Kullanim:
    python scripts/smoke_ollama.py
"""

from __future__ import annotations

import asyncio
import sys

from app.config import get_settings
from app.llm.base import InferenceRequest
from app.llm.ollama import OllamaClient


async def main() -> int:
    settings = get_settings()
    client = OllamaClient(settings)
    print(f"Ollama host : {settings.ollama_host}")
    print(f"Model       : {settings.ollama_model}")
    try:
        healthy = await client.health()
        print(f"Health      : {'OK' if healthy else 'ERISILEMEDI'}")
        if not healthy:
            return 2

        request = InferenceRequest(
            messages=[{"role": "user", "content": "Tek kelimeyle cevap ver: merhaba"}],
            temperature=0.0,
            max_output_tokens=16,
        )
        result = await client.generate(request)
        print("--- Cevap ---")
        print(result.text.strip())
        print(
            f"prompt_tokens={result.prompt_tokens} "
            f"completion_tokens={result.completion_tokens} "
            f"duration_ms={result.duration_ms}"
        )
        return 0
    finally:
        await client.aclose()


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
