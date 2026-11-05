"""SQLAlchemy ORM modelleri.

PostgreSQL sistemin ana ve guvenilir veri kaynagidir. Sik sorgulanan degerler
(status, lease_until, next_retry_at vb.) JSONB icinde degil normal kolonlarda
tutulur ve uygun indekslerle desteklenir.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.domain.enums import JobStatus, OutboxStatus


class Base(DeclarativeBase):
    pass


def _uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = _uuid_pk()
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Isteğe bagli, proje bazli limit override'lari (NULL ise global limit kullanilir).
    max_active_jobs: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_pending_jobs: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_output_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    api_clients: Mapped[list[ApiClient]] = relationship(back_populates="project")


class ApiClient(Base):
    """Proje bazli API anahtari kaydi.

    `id` ayni zamanda API anahtarinin `key_id` kismidir. Anahtarin acik `secret`
    kismi veritabaninda SAKLANMAZ; yalnizca HMAC-SHA256 hash'i tutulur.
    """

    __tablename__ = "api_clients"

    id: Mapped[uuid.UUID] = _uuid_pk()
    project_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    secret_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    project: Mapped[Project] = relationship(back_populates="api_clients")

    __table_args__ = (Index("ix_api_clients_project", "project_id"),)


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = _uuid_pk()
    project_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    idempotency_key: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=JobStatus.QUEUED.value)

    request_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    response_schema: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    generation: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    model_provider: Mapped[str] = mapped_column(String(40), nullable=False)
    model_name: Mapped[str] = mapped_column(String(120), nullable=False)

    worker_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    lease_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attempt: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_retry_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    error_code: Mapped[str | None] = mapped_column(String(60), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    prompt_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completion_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    # Retention ile hassas payload/result temizlendiginde isaretlenir.
    purged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("project_id", "idempotency_key", name="uq_jobs_project_idempotency"),
        Index("ix_jobs_project_created", "project_id", "created_at"),
        Index("ix_jobs_status_updated", "status", "updated_at"),
        Index("ix_jobs_status_next_retry", "status", "next_retry_at"),
        Index("ix_jobs_status_lease", "status", "lease_until"),
        Index("ix_jobs_created_at", "created_at"),
    )


class JobAttempt(Base):
    __tablename__ = "job_attempts"

    id: Mapped[uuid.UUID] = _uuid_pk()
    job_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
    worker_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    outcome: Mapped[str | None] = mapped_column(String(20), nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(60), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completion_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("job_id", "attempt_number", name="uq_job_attempt_number"),
        Index("ix_job_attempts_job", "job_id"),
    )


class OutboxMessage(Base):
    __tablename__ = "outbox"

    id: Mapped[uuid.UUID] = _uuid_pk()
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True
    )
    topic: Mapped[str] = mapped_column(String(120), nullable=False)
    event_type: Mapped[str] = mapped_column(String(60), nullable=False)
    event_version: Mapped[str] = mapped_column(String(10), nullable=False, default="1")
    partition_key: Mapped[str] = mapped_column(String(120), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=OutboxStatus.PENDING.value
    )
    attempt: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    available_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_outbox_status_available", "status", "available_at"),
        CheckConstraint("attempt >= 0", name="ck_outbox_attempt_nonneg"),
    )
