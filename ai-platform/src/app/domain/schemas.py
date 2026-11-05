"""API istek/yanit Pydantic modelleri.

Istemciler camelCase alanlar gonderir/alir (ornegin ``maxOutputTokens``,
``responseSchema``, ``jobId``). Model adi veya Ollama ayarlari istemci tarafindan
belirlenemez; bu alanlar request semasinda yer almaz.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class Message(CamelModel):
    role: Literal["system", "user", "assistant"]
    content: str


class Generation(CamelModel):
    temperature: float | None = None
    max_output_tokens: int | None = Field(default=None, ge=1)
    top_p: float | None = Field(default=None, ge=0.0, le=1.0)


class CreateJobRequest(CamelModel):
    messages: list[Message]
    generation: Generation | None = None
    response_schema: dict[str, Any] | None = None


class CreateJobResponse(CamelModel):
    job_id: uuid.UUID
    status: str
    created_at: datetime
    status_url: str


class JobExecution(CamelModel):
    provider: str
    model: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    duration_ms: int | None = None


class JobError(CamelModel):
    code: str
    message: str


class JobStatusResponse(CamelModel):
    job_id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime
    result: dict[str, Any] | None = None
    execution: JobExecution | None = None
    error: JobError | None = None


class ErrorResponse(CamelModel):
    code: str
    message: str
    correlation_id: str | None = None
