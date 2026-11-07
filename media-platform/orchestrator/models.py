"""Genellestirilmis durum modeli (SQLAlchemy 2.0).

document_control'un Document/ProcessingJob/ProcessingAttempt/OutboxEvent desenini
genellestirir: Document -> Asset (kind: PDF|IMAGE|AUDIO|VIDEO + profile). Turetilmis
sonuc SealedResult olarak sealed + kisa TTL saklanir (kalici DEGIL). Her tabloda
tenant_id.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


def _uuid():
    return str(uuid.uuid4())


def utcnow():
    """Naive-UTC. Tum zaman damgalari bu yardimciyla uretilir ve ayni tipte
    karsilastirilir. Kolonlar da naive `DateTime` (TIMESTAMP WITHOUT TIME ZONE)
    oldugundan SQLite VE Postgres'te tutarli: Postgres timestamptz aware deger
    dondurup naive utcnow() ile karsilastirma TypeError'u verirdi."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


_now = utcnow


class Base(DeclarativeBase):
    pass


class Asset(Base):
    __tablename__ = "asset"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    kind: Mapped[str] = mapped_column(String(16))  # PDF | IMAGE | AUDIO | VIDEO
    profile: Mapped[str] = mapped_column(String(64))  # document | media
    document_type: Mapped[str] = mapped_column(String(32))  # STUDENT | CRIMINAL_RECORD | ""
    status: Mapped[str] = mapped_column(String(16), default="PENDING")
    current_job_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    error_code: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    jobs: Mapped[list["ProcessingJob"]] = relationship(back_populates="asset")


class ProcessingJob(Base):
    __tablename__ = "processing_job"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    asset_id: Mapped[str] = mapped_column(ForeignKey("asset.id"), index=True)
    kind: Mapped[str] = mapped_column(String(16))  # INGESTION | ANALYSIS | ASR_CHUNK
    stage: Mapped[str] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(16), default="PENDING")
    # Fan-out/fan-in (medya ASR): cocuk job'lar parent'a baglanir; parent
    # pending_children sayaci ile barrier tutar, sifirlaninca MERGE'e gecer.
    parent_job_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    chunk_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    chunk_total: Mapped[int] = mapped_column(Integer, default=0)
    pending_children: Mapped[int] = mapped_column(Integer, default=0)
    rule_version: Mapped[str] = mapped_column(String(32), default="")
    profile_version: Mapped[str] = mapped_column(String(64), default="")
    profile_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    ocr_pages: Mapped[list] = mapped_column(JSON, default=list)
    ocr_done: Mapped[bool] = mapped_column(Boolean, default=False)
    error_code: Mapped[str] = mapped_column(String(64), default="")
    correlation_id: Mapped[str] = mapped_column(String(36), default=_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    asset: Mapped["Asset"] = relationship(back_populates="jobs")
    attempts: Mapped[list["ProcessingAttempt"]] = relationship(back_populates="job")


class ProcessingAttempt(Base):
    __tablename__ = "processing_attempt"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    job_id: Mapped[str] = mapped_column(ForeignKey("processing_job.id"), index=True)
    stage: Mapped[str] = mapped_column(String(16))
    number: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(16), default="RUNNING")
    lease_token: Mapped[str] = mapped_column(String(36), default=_uuid, index=True)
    lease_until: Mapped[datetime] = mapped_column(DateTime)
    error_code: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    job: Mapped["ProcessingJob"] = relationship(back_populates="attempts")


class OutboxEvent(Base):
    __tablename__ = "outbox_event"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    job_id: Mapped[str] = mapped_column(ForeignKey("processing_job.id"), index=True)
    stage: Mapped[str] = mapped_column(String(16))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class SealedResult(Base):
    __tablename__ = "sealed_result"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    job_id: Mapped[str] = mapped_column(ForeignKey("processing_job.id"), unique=True, index=True)
    asset_id: Mapped[str] = mapped_column(ForeignKey("asset.id"), index=True)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    rule_version: Mapped[str] = mapped_column(String(32), default="")
    profile_version: Mapped[str] = mapped_column(String(64), default="")
    envelope: Mapped[dict] = mapped_column(JSON)  # seal_value ciktisi (sealed)
    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    expires_at: Mapped[datetime] = mapped_column(DateTime)


class UsageLog(Base):
    """Kullanim/metering kaydi (icerik YOK; yalniz metadata). Kota (gunluk tavan)
    ve faturalama bu tablodan okur. PII payload tutmaz."""

    __tablename__ = "usage_log"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    asset_id: Mapped[str] = mapped_column(String(36), index=True)
    profile: Mapped[str] = mapped_column(String(64), default="")
    kind: Mapped[str] = mapped_column(String(16), default="")
    event: Mapped[str] = mapped_column(String(16))  # SUBMITTED | COMPLETED | FAILED
    units: Mapped[int] = mapped_column(Integer, default=1)  # faturalama birimi (sayfa/chunk)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now, index=True)


class WebhookDelivery(Base):
    """Outbox-driven webhook teslim kaydi (en-az-bir-kez + retry/backoff).

    Icerik tasimaz; yalniz event + referanslar. Caller imzayi dogrulayip sonucu
    GET /result ile ceker (delete-on-delivery)."""

    __tablename__ = "webhook_delivery"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    asset_id: Mapped[str] = mapped_column(String(36), index=True)
    job_id: Mapped[str] = mapped_column(String(36), index=True)
    event: Mapped[str] = mapped_column(String(32))  # job.completed | job.failed
    url: Mapped[str] = mapped_column(String(1024))
    status: Mapped[str] = mapped_column(String(16), default="PENDING")  # PENDING|DELIVERED|FAILED
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    next_attempt_at: Mapped[datetime] = mapped_column(DateTime, default=_now, index=True)
    last_error: Mapped[str] = mapped_column(String(256), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
