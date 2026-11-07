"""Orchestrator state machine (document_control orchestrator.py deseninden port).

Garantiler korunur: lease'li attempt (<=3), outbox + reconcile kaynak-dogrulugu,
payload kuyruga girmez (yalnizca ephemeral + job_id). Turetilmis sonuc sealed +
kisa TTL (SealedResult), teslimde silinir. Satir kilidi yerine surec-ici global
RLock (SQLite tek-yazar); Postgres'te select_for_update'e cevrilir.
"""

import json
import re
import threading
from datetime import timedelta

from config.settings import settings
from platform_core import ephemeral
from platform_core.crypto import seal_value
from platform_core.errors import DomainError
from services.evaluation.rules import profile_for, rules_for
from services.ingestion.formats import identify
from orchestrator import db, usage, webhook
from orchestrator.contracts import JobMessage
from orchestrator.dispatch import get_dispatcher
from orchestrator.models import (
    Asset,
    OutboxEvent,
    ProcessingAttempt,
    ProcessingJob,
    SealedResult,
    utcnow,
)
from orchestrator.pipeline import (
    DOCUMENT_NEXT,
    MEDIA_NEXT,
    STAGE_INPUT_KINDS,
    TERMINAL,
    lease_seconds,
    role_for,
)

_CHUNK_KEY = re.compile(r"TRANSCRIPT_CHUNK_(\d+)")
_MAX_CHUNKS = 2048  # fan-out tavani (DoS/kaynak sinirlamasi)

_ENGINE_LOCK = threading.RLock()


# --------------------------------------------------------------------------- #
# Yardimcilar
# --------------------------------------------------------------------------- #
def _get_job(sess, identifier):
    job = sess.get(ProcessingJob, str(identifier))
    if job is None:
        raise DomainError("NOT_FOUND", 404)
    return job


def _current(job):
    asset = job.asset
    if asset.deleted_at is not None:
        return False
    # Cocuk ASR job'lari, parent'lari asset'in guncel job'u oldugu surece aktiftir.
    return asset.current_job_id in (job.id, job.parent_job_id)


def _attempts(sess, job, **filters):
    query = sess.query(ProcessingAttempt).filter_by(job_id=job.id, **filters)
    return query


def _publish(job):
    get_dispatcher().publish(
        JobMessage(
            schema_version=1,
            asset_id=job.asset_id,
            job_id=job.id,
            operation=job.stage,
            correlation_id=job.correlation_id,
            tenant_id=job.asset.tenant_id,
        ).to_dict()
    )


def _enqueue(sess, job, stage):
    job.stage = stage
    job.status = "PENDING"
    # In-memory dispatch senkron oldugundan published_at hemen set edilir;
    # reconcile "yayinlandi ama islenmedi" PENDING job'lari bununla tespit eder.
    sess.add(OutboxEvent(job_id=job.id, stage=stage, published_at=utcnow()))
    sess.flush()
    # Outbox yazimi commit edildikten SONRA yayinla (en-az-bir-kez).
    sess.info.setdefault("_publish", []).append(job)


def _flush_publications(sess):
    for job in sess.info.pop("_publish", []):
        _publish(job)


# --------------------------------------------------------------------------- #
# Intake (public submit)
# --------------------------------------------------------------------------- #
def submit(tenant_id, document_type="", data=b"", *, profile="document"):
    if profile == "document":
        if document_type not in ("STUDENT", "CRIMINAL_RECORD"):
            raise DomainError("INVALID_INPUT", 400)
        identify(data)  # bounded format kontrolu (PDF/JPEG/PNG)
        kind = "PDF"
    elif profile == "media":
        from services.media import ffmpeg

        kind = {"WAV": "AUDIO", "AUDIO": "AUDIO", "VIDEO": "VIDEO"}[
            ffmpeg.identify_media(data)
        ]
        document_type = ""  # medya ciktisi transkript; detection profili yok
    else:
        raise DomainError("INVALID_INPUT", 400)

    with _ENGINE_LOCK, db.session() as sess:
        usage.enforce(sess, tenant_id)  # kota (eszamanlilik + gunluk hacim)
        asset = Asset(
            tenant_id=tenant_id,
            kind=kind,
            profile=profile,
            document_type=document_type,
            status="PENDING",
        )
        sess.add(asset)
        sess.flush()
        ephemeral.put(asset.id, "QUARANTINE", data)
        usage.record(sess, asset, "SUBMITTED")
        job = _create_job(sess, asset, "INGESTION", "INGEST")
        sess.commit()
        result = {"asset_id": asset.id, "job_id": job.id}
        _flush_publications(sess)
        return result


_MEDIA_RULE = "faster-whisper-ct2-v1"
_MEDIA_PROFILE = "media-transcript-v1"


def _create_job(sess, asset, kind, stage, *, parent=None, chunk_index=None):
    if asset.profile == "media":
        rule_version, profile_version, verified = _MEDIA_RULE, _MEDIA_PROFILE, True
    else:
        profile_version = profile_for(asset.document_type)
        rule_version = rules_for(asset.document_type)
        verified = f"{asset.document_type}:{profile_version}" in settings.VERIFIED_PROFILES
    job = ProcessingJob(
        asset_id=asset.id,
        kind=kind,
        stage=stage,
        status="PENDING",
        rule_version=rule_version,
        profile_version=profile_version,
        profile_verified=verified,
        parent_job_id=parent.id if parent else None,
        chunk_index=chunk_index,
    )
    sess.add(job)
    sess.flush()
    if parent is None:
        # Yalnizca parent/zincir job'lari asset'in guncel job'udur; cocuk ASR
        # job'lari parent uzerinden aktiflesir (bkz. _current).
        asset.current_job_id = job.id
        asset.status = "PENDING"
        asset.error_code = ""
    sess.add(OutboxEvent(job_id=job.id, stage=stage, published_at=utcnow()))
    sess.info.setdefault("_publish", []).append(job)
    return job


# --------------------------------------------------------------------------- #
# claim / input / complete / failed
# --------------------------------------------------------------------------- #
def claim(job_id, stage, role):
    with _ENGINE_LOCK, db.session() as sess:
        job = _get_job(sess, job_id)
        if role_for(stage) != role:
            raise DomainError("FORBIDDEN", 403)
        if not _current(job) or job.status in TERMINAL or job.stage != stage:
            return {"skip": True}
        if stage == "ASR" and job.chunk_index is None:
            # Parent barrier job'u ASR asamasinda bekler; transkript edilmez.
            return {"skip": True}
        if _attempts(sess, job, stage=stage, status="RUNNING").first():
            return {"skip": True}
        count = _attempts(sess, job, stage=stage).count()
        if count >= 3:
            _terminal_failure(sess, job, "RETRY_EXHAUSTED")
            sess.commit()
            return {"skip": True}
        attempt = ProcessingAttempt(
            job_id=job.id,
            stage=stage,
            number=count + 1,
            status="RUNNING",
            lease_until=utcnow() + timedelta(seconds=lease_seconds(stage)),
        )
        sess.add(attempt)
        job.status = "PROCESSING"
        job.asset.status = "PROCESSING"
        chunk_index, chunk_total = job.chunk_index, job.chunk_total
        offset = _chunk_offset(job) if stage == "ASR" else None
        sess.commit()
        work = {
            "skip": False,
            "lease": attempt.lease_token,
            "profile": job.asset.profile,
            "document_type": job.asset.document_type,
            "ocr_pages": job.ocr_pages,
            "ocr_done": job.ocr_done,
            "verified": job.profile_verified,
        }
        if stage == "DEMUX":
            work["max_chunk_sec"] = settings.MEDIA_MAX_CHUNK_SEC
        elif stage == "ASR":
            work["chunk_index"] = chunk_index
            work["chunk_offset"] = offset
        elif stage == "MERGE":
            work["chunk_total"] = chunk_total
        return work


def _active_attempt(sess, job, lease, role):
    attempt = (
        _attempts(sess, job, lease_token=str(lease), status="RUNNING", stage=job.stage).first()
    )
    if (
        not attempt
        or not _current(job)
        or attempt.lease_until <= utcnow()
        or role_for(job.stage) != role
    ):
        raise DomainError("STALE_ATTEMPT", 409)
    return attempt


def input_bytes(job_id, lease, role, kind):
    with _ENGINE_LOCK, db.session() as sess:
        job = _get_job(sess, job_id)
        _active_attempt(sess, job, lease, role)
        # Medya: dinamik chunk anahtarlari (parent job'una gore keylenir).
        if job.stage == "ASR":
            if kind != "AUDIO_CHUNK":
                raise DomainError("FORBIDDEN", 403)
            return ephemeral.read(
                job.asset_id, f"AUDIO_CHUNK_{job.chunk_index}", job.parent_job_id
            )
        if job.stage == "MERGE":
            if kind != "CHUNK_MANIFEST" and not _CHUNK_KEY.fullmatch(kind):
                raise DomainError("FORBIDDEN", 403)
            return ephemeral.read(job.asset_id, kind, job.id)
        if kind not in STAGE_INPUT_KINDS.get(job.stage, set()):
            raise DomainError("FORBIDDEN", 403)
        ephemeral_job = job.id if kind in ("PDF_TEXT", "OCR") else None
        return ephemeral.read(job.asset_id, kind, ephemeral_job)


def complete(job_id, lease, role, output=None, binary=None):
    with _ENGINE_LOCK, db.session() as sess:
        job = _get_job(sess, job_id)
        attempt = _active_attempt(sess, job, lease, role)
        stage, asset = job.stage, job.asset

        if stage == "INGEST" and asset.profile == "media":
            from services.media import ffmpeg

            data = ephemeral.read(asset.id, "QUARANTINE")
            source_format = ffmpeg.identify_media(data)  # bounded re-validate
            original = binary if binary is not None else data
            ephemeral.put(asset.id, "SOURCE_FORMAT", source_format.encode("ascii"))
            ephemeral.put(asset.id, "ORIGINAL", original)
            ephemeral.remove(asset.id, "QUARANTINE")
            job.status, job.finished_at = "COMPLETED", utcnow()
            _create_job(sess, asset, "ANALYSIS", MEDIA_NEXT["INGEST"])
        elif stage == "INGEST":
            data = ephemeral.read(asset.id, "QUARANTINE")
            source_format = identify(data)
            normalized = binary if binary is not None else data
            if identify(normalized) != "PDF":
                raise DomainError("INVALID_OUTPUT", 422)
            ephemeral.put(asset.id, "SOURCE_FORMAT", source_format.encode("ascii"))
            ephemeral.put(asset.id, "ORIGINAL", normalized)
            ephemeral.remove(asset.id, "QUARANTINE")
            job.status, job.finished_at = "COMPLETED", utcnow()
            _create_job(sess, asset, "ANALYSIS", "EXTRACT")
        elif stage == "DEMUX":
            _fanout_asr(sess, job, output)
        elif stage == "ASR":
            _complete_asr_chunk(sess, job, output)
        elif stage == "MERGE":
            _finish_media_result(sess, job, output)
        elif stage in ("EXTRACT", "OCR"):
            from services.extraction.contracts import output_schema

            method = "PDF_TEXT" if stage == "EXTRACT" else "OCR"
            output_schema(output, method)
            ephemeral.put(asset.id, method, json.dumps(output).encode(), job.id)
            if stage == "OCR":
                job.ocr_done = True
            _enqueue(sess, job, "EVALUATE")
        elif stage == "EVALUATE":
            from services.evaluation.contracts import result_schema

            result_schema(output)
            pages = output.pop("needs_ocr_pages", [])
            if pages and not job.ocr_done:
                if any(
                    type(p) is not int or not 1 <= p <= settings.MAX_PDF_PAGES for p in pages
                ):
                    raise DomainError("INVALID_OUTPUT", 422)
                job.ocr_pages = sorted(set(pages))
                _enqueue(sess, job, "OCR")
            else:
                _finish_result(sess, job, output)
        else:
            raise DomainError("INVALID_OUTPUT", 422)

        attempt.status, attempt.finished_at = "COMPLETED", utcnow()
        sess.commit()
        _flush_publications(sess)
        return {"accepted": True}


def failed(job_id, lease, role, code):
    with _ENGINE_LOCK, db.session() as sess:
        job = _get_job(sess, job_id)
        attempt = _active_attempt(sess, job, lease, role)
        _handle_failure(sess, job, attempt, code)
        sess.commit()
        _flush_publications(sess)
        return {"accepted": True}


# --------------------------------------------------------------------------- #
# Tenant yuzeyi (public API): durum + iptal
# --------------------------------------------------------------------------- #
def job_status(tenant_id, job_id):
    with _ENGINE_LOCK, db.session() as sess:
        job = sess.get(ProcessingJob, str(job_id))
        if job is None or job.asset.tenant_id != tenant_id:
            raise DomainError("NOT_FOUND", 404)
        return {
            "job_id": job.id,
            "asset_id": job.asset_id,
            "status": job.asset.status,
            "stage": job.stage,
            "error_code": job.asset.error_code or job.error_code,
            "result_ready": job.asset.status == "COMPLETED",
        }


def cancel(tenant_id, job_id):
    with _ENGINE_LOCK, db.session() as sess:
        job = sess.get(ProcessingJob, str(job_id))
        if job is None or job.asset.tenant_id != tenant_id:
            raise DomainError("NOT_FOUND", 404)
        asset = job.asset
        asset.deleted_at = asset.deleted_at or utcnow()
        for sibling in sess.query(ProcessingJob).filter_by(asset_id=asset.id).all():
            if sibling.status not in TERMINAL:
                sibling.status, sibling.finished_at = "CANCELLED", utcnow()
                for attempt in _attempts(sess, sibling, status="RUNNING").all():
                    attempt.status = "CANCELLED"
        asset.status, asset.error_code = "CANCELLED", "CANCELLED_BY_TENANT"
        ephemeral.clear_document(asset.id)
        sess.commit()
        return {"job_id": job.id, "status": "CANCELLED"}


# --------------------------------------------------------------------------- #
# Sonuc muhurleme (turetilmis veri: sealed + kisa TTL, kalici DEGIL)
# --------------------------------------------------------------------------- #
def _finish_result(sess, job, output):
    try:
        source_format = ephemeral.read(job.asset_id, "SOURCE_FORMAT").decode("ascii")
    except DomainError as error:
        if error.code != "DOCUMENT_DATA_EXPIRED":
            raise
        source_format = "PDF"
    output.setdefault("document_metadata", {})["source_format"] = source_format

    reasons = set(output.get("warnings", []))
    if job.error_code:
        reasons.add(job.error_code)
    if not job.profile_verified:
        reasons.add("PROFILE_NOT_VERIFIED")
        for field in ("student_status", "criminal_status", "archive_status"):
            if output.get(field):
                output[field] = "UNKNOWN"
    output["warnings"] = output["reason_codes"] = sorted(reasons)

    envelope = seal_value(
        json.dumps(output, ensure_ascii=False), f"result:{job.id}"
    )
    sess.add(
        SealedResult(
            job_id=job.id,
            asset_id=job.asset_id,
            tenant_id=job.asset.tenant_id,
            rule_version=job.rule_version,
            profile_version=job.profile_version,
            envelope=envelope,
            expires_at=utcnow() + timedelta(seconds=settings.RESULT_TTL_SECONDS),
        )
    )
    job.status, job.finished_at = "COMPLETED", utcnow()
    job.asset.status = "COMPLETED"
    usage.record(sess, job.asset, "COMPLETED")
    webhook.enqueue(sess, job.asset, job.id, "job.completed")
    # Orijinal + ara byte'lar derhal silinir (processor, system-of-record degil).
    ephemeral.clear_document(job.asset_id)


# --------------------------------------------------------------------------- #
# Medya fan-out/fan-in (DEMUX -> N ASR chunk -> barrier -> MERGE)
# --------------------------------------------------------------------------- #
def _read_manifest(asset_id, parent_job_id):
    raw = ephemeral.read(asset_id, "CHUNK_MANIFEST", parent_job_id)
    return json.loads(raw.decode("utf-8"))


def _chunk_offset(job):
    manifest = _read_manifest(job.asset_id, job.parent_job_id)
    for chunk in manifest["chunks"]:
        if chunk["index"] == job.chunk_index:
            return float(chunk["start"])
    raise DomainError("INVALID_INPUT", 400)


def _fanout_asr(sess, parent, output):
    """DEMUX ciktisindan (chunk manifesti) N cocuk ASR job'u uretir.

    Chunk ses byte'larini DEMUX worker'i dogrudan ephemeral'a yazmistir
    (AUDIO_CHUNK_<i>, parent job'una keylenir); kuyruga yalnizca manifest girer.
    """
    chunks = output.get("chunks") if isinstance(output, dict) else None
    if not isinstance(chunks, list) or not chunks or len(chunks) > _MAX_CHUNKS:
        raise DomainError("INVALID_OUTPUT", 422)
    for index, chunk in enumerate(chunks):
        try:
            start, end = float(chunk["start"]), float(chunk["end"])
        except (KeyError, TypeError, ValueError):
            raise DomainError("INVALID_OUTPUT", 422)
        if chunk.get("index") != index or not 0.0 <= start <= end:
            raise DomainError("INVALID_OUTPUT", 422)
    duration = float(output.get("duration", chunks[-1]["end"]))
    ephemeral.put(
        parent.asset_id,
        "CHUNK_MANIFEST",
        json.dumps({"chunks": chunks, "duration": duration}).encode("utf-8"),
        parent.id,
    )
    parent.status, parent.stage = "PROCESSING", "ASR"
    parent.chunk_total = parent.pending_children = len(chunks)
    for chunk in chunks:
        _create_job(
            sess, parent.asset, "ASR_CHUNK", "ASR", parent=parent, chunk_index=chunk["index"]
        )


def _complete_asr_chunk(sess, child, output):
    from services.asr.contracts import transcript_schema

    transcript_schema(output)
    ephemeral.put(
        child.asset_id,
        f"TRANSCRIPT_CHUNK_{child.chunk_index}",
        json.dumps(output).encode("utf-8"),
        child.parent_job_id,
    )
    child.status, child.finished_at = "COMPLETED", utcnow()
    parent = sess.get(ProcessingJob, child.parent_job_id)
    parent.pending_children -= 1
    if parent.pending_children <= 0:
        _enqueue(sess, parent, "MERGE")


def _finish_media_result(sess, job, output):
    from services.asr.contracts import transcript_schema

    transcript_schema(output)
    envelope = seal_value(json.dumps(output, ensure_ascii=False), f"result:{job.id}")
    sess.add(
        SealedResult(
            job_id=job.id,
            asset_id=job.asset_id,
            tenant_id=job.asset.tenant_id,
            rule_version=job.rule_version,
            profile_version=job.profile_version,
            envelope=envelope,
            expires_at=utcnow() + timedelta(seconds=settings.RESULT_TTL_SECONDS),
        )
    )
    job.status, job.finished_at = "COMPLETED", utcnow()
    job.asset.status = "COMPLETED"
    usage.record(sess, job.asset, "COMPLETED")
    webhook.enqueue(sess, job.asset, job.id, "job.completed")
    # Orijinal medya + tum chunk byte'lari (ses + transkript) derhal silinir.
    ephemeral.clear_document(job.asset_id)


# --------------------------------------------------------------------------- #
# Hata yolu
# --------------------------------------------------------------------------- #
def _terminal_failure(sess, job, code):
    code = code or "WORKER_FAILED"
    job.status, job.error_code, job.finished_at = "FAILED", code, utcnow()
    asset = job.asset
    if job.parent_job_id:
        # Cocuk ASR hatasi tum medya job'unu dusurur (OCR'in aksine graceful degil).
        parent = sess.get(ProcessingJob, job.parent_job_id)
        if parent and parent.status not in TERMINAL:
            parent.status, parent.error_code, parent.finished_at = "FAILED", code, utcnow()
    if asset.current_job_id in (job.id, job.parent_job_id):
        asset.status, asset.error_code = "FAILED", code
        usage.record(sess, asset, "FAILED")
        webhook.enqueue(sess, asset, job.id, "job.failed")
        ephemeral.clear_document(asset.id)


def _handle_failure(sess, job, attempt, code):
    code = code or "WORKER_FAILED"
    attempt.status, attempt.error_code, attempt.finished_at = "FAILED", code, utcnow()
    retryable = {
        "SCANNER_UNAVAILABLE",
        "RAM_STORE_UNAVAILABLE",
        "FETCH_UNAVAILABLE",
        "SERVICE_UNAVAILABLE",
        "LEASE_EXPIRED",
        "WORKER_FAILED",
    }
    if job.stage == "OCR" and code in ("OCR_TIMEOUT", "OCR_UNAVAILABLE", "LEASE_EXPIRED"):
        # OCR basarisizliginda dijital-PDF kaniti ile EVALUATE'e dus (graceful).
        job.ocr_done, job.error_code = True, code
        _enqueue(sess, job, "EVALUATE")
    elif code in retryable and attempt.number < 3:
        _enqueue(sess, job, job.stage)
    else:
        _terminal_failure(sess, job, code)


# --------------------------------------------------------------------------- #
# reconcile (lease suresi dolan attempt + yetim PENDING job + stale asset)
# --------------------------------------------------------------------------- #
def reconcile():
    with _ENGINE_LOCK, db.session() as sess:
        now = utcnow()
        pending = (
            sess.query(ProcessingJob)
            .filter(ProcessingJob.status.in_(["PENDING", "PROCESSING"]))
            .all()
        )
        for job in pending:
            if not _current(job):
                job.status, job.finished_at = "CANCELLED", now
                for attempt in _attempts(sess, job, status="RUNNING").all():
                    attempt.status = "CANCELLED"
                asset = job.asset
                if asset.current_job_id == job.id and asset.deleted_at is None:
                    asset.status, asset.error_code = "CANCELLED", "STALE_RESULT"
            elif job.status == "PENDING":
                latest = (
                    sess.query(OutboxEvent)
                    .filter_by(job_id=job.id, stage=job.stage)
                    .order_by(OutboxEvent.created_at.desc())
                    .first()
                )
                if (
                    latest
                    and latest.published_at
                    and latest.published_at < now - timedelta(seconds=60)
                ):
                    _enqueue(sess, job, job.stage)

        expired = (
            sess.query(ProcessingAttempt)
            .filter(ProcessingAttempt.status == "RUNNING", ProcessingAttempt.lease_until < now)
            .all()
        )
        for attempt in expired:
            job = sess.get(ProcessingJob, attempt.job_id)
            if _current(job) and job.status not in TERMINAL:
                _handle_failure(sess, job, attempt, "LEASE_EXPIRED")
            else:
                attempt.status = "CANCELLED"
        sess.commit()
        _flush_publications(sess)
