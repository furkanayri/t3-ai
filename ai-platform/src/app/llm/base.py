"""Model saglayici soyutlamasi.

Ollama entegrasyonu bu arayuz arkasinda gelistirilir. Ileride vLLM gibi baska
bir saglayici ayni arayuzu uygulayabilir (bu surumde vLLM yoktur).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class InferenceRequest:
    messages: list[dict[str, str]]
    temperature: float
    max_output_tokens: int
    top_p: float | None = None
    json_schema: dict[str, Any] | None = None


@dataclass(frozen=True)
class InferenceResult:
    text: str
    prompt_tokens: int | None
    completion_tokens: int | None
    duration_ms: int
    raw: dict[str, Any] = field(default_factory=dict)


class ModelClient(ABC):
    @property
    @abstractmethod
    def provider(self) -> str: ...

    @property
    @abstractmethod
    def model(self) -> str: ...

    @abstractmethod
    async def generate(self, request: InferenceRequest) -> InferenceResult: ...

    @abstractmethod
    async def health(self) -> bool: ...

    @abstractmethod
    async def warmup(self) -> None: ...

    @abstractmethod
    async def aclose(self) -> None: ...
