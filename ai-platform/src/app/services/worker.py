"""AI Worker isleme mantigi.

Her mesaj icin akis:
1. Mesaj semasini dogrula (bozuksa DLQ).
2. Job'i PostgreSQL'den getir; COMPLETED/terminal ise model cagirmadan commit et.
3. Job'i atomik olarak sahiplen (claim) ve RUNNING yap + lease.
4. Attempt kaydi olustur.
5. Request payload'u DB'den oku; Ollama'yi cagir (lease heartbeat ile).
6. Response schema varsa JSON Schema ile dogrula (sinirli duzeltme denemesi).
7. Sonucu DB'ye yaz, job'i COMPLETED yap, completed outbox olustur.
8. Transaction tamamlaninca Kafka offset'i commit edilir (ConsumerRunner).

DB transaction'lari kisa tutulur; Ollama cagrisi boyunca transaction ACIK TUTULMAZ.
"""

from __future__ import annotations

import asyncio
import json
import uuid
from dataclasses import dataclass
from datetime import timedelta
from typing import Any

from pydantic import ValidationError

from app.config import Settings
from app.db import repositories as repo
from app.db.engine import Database
from app.db.models import Project
from app.domain import events
from app.domain.enums import ErrorCode, JobStatus
from app.domain.errors import ProcessingError
from app.domain.events import JobEventMessage
from app.domain.json_schema import validate_output_against_schema
from app.kafka.consumer import ConsumerMessage
from app.llm.base import InferenceRequest, InferenceResult, ModelClient
from app.logging import get_logger, set_correlation_id
from app.metrics import (
    completion_tokens_total,
    job_queue_wait_seconds,
    job_total_duration_seconds,
    jobs_completed_total,
    jobs_dlq_total,
    jobs_failed_total,
    jobs_retried_total,
    ollama_inference_duration_seconds,
    prompt_tokens_total,
    tokens_per_second,
    worker_active_jobs,
)

logger = get_logger(__name__)


@dataclass
class JobSnapshot:
    id: uuid.UUID
    project_id: uuid.UUID
    project_code: str
    attempt: int
    messages: list[dict[str, str]]
    generation: dict[str, Any]
    response_schema: dict[str, Any] | None
    created_at_epoch: float


class JobProcessor:
    def __init__(
        self,
        settings: Settings,
        db: Database,
        model_client: ModelClient,
        *,
        worker_id: str,
    ):
        self._settings = settings
        self._db = db
        self._model = model_client
        self._worker_id = worker_id
        self._inference_semaphore = asyncio.Semaphore(settings.max_concurrent_inference)

    async def handle(self, cm: ConsumerMessage) -> bool:
        try:
            message = JobEventMessage.model_validate_json(cm.value)
        except ValidationError as exc:
            logger.warning("bozuk kafka mesaji -> DLQ", extra={"error": str(exc)})
            await self._dead_letter_raw(cm.value)
            return True

        set_correlation_id(message.correlation_id)
        return await self._process(message)

    async def _process(self, message: JobEventMessage) -> bool:
        snapshot = await self._load_and_claim(message.job_id)
        if snapshot is None:
            return True  # not found / terminal / baska worker sahiplendi

        correlation_id = message.correlation_id

        async def heartbeat() -> None:
            while True:
                await asyncio.sleep(self._settings.worker_heartbeat_seconds)
                async with self._db.session() as s:
                    await repo.renew_lease(
                        s, snapshot.id, self._worker_id, self._settings.worker_lease_seconds
                    )

        hb_task = asyncio.create_task(heartbeat())
        try:
            result, result_payload = await self._run_inference(snapshot)
        except ProcessingError as exc:
            hb_task.cancel()
            await self._handle_failure(snapshot, exc, correlation_id)
            return True
        except Exception as exc:  # noqa: BLE001
            hb_task.cancel()
            internal = ProcessingError(ErrorCode.INTERNAL, "Beklenmeyen worker hatasi")
            await self._handle_failure(snapshot, internal, correlation_id)
            logger.error("worker beklenmeyen hata", extra={"error": str(exc)})
            return True
        finally:
            hb_task.cancel()

        await self._complete(snapshot, result, result_payload, correlation_id)
        return True

    async def _load_and_claim(self, job_id: uuid.UUID) -> JobSnapshot | None:
        # 1) Oku: var mi, terminal mi?
        async with self._db.session() as s:
            job = await repo.get_job(s, job_id)
            if job is None:
                logger.info("job bulunamadi, atlaniyor", extra={"job_id": str(job_id)})
                return None
            if job.status in {s_.value for s_ in (
                JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.DEAD_LETTER
            )}:
                logger.info(
                    "job zaten terminal durumda, model cagrilmiyor",
                    extra={"job_id": str(job_id), "status": job.status},
                )
                return None
            project_code = (await s.get(Project, job.project_id)).code  # type: ignore[union-attr]

        # 2) Atomik claim.
        async with self._db.begin() as s:
            claimed = await repo.claim_job(
                s, job_id, self._worker_id, self._settings.worker_lease_seconds
            )
            if claimed is None:
                logger.info(
                    "job sahiplenemedi (baska worker veya terminal)",
                    extra={"job_id": str(job_id)},
                )
                return None
            repo.add_attempt(s, claimed, self._worker_id)
            snapshot = JobSnapshot(
                id=claimed.id,
                project_id=claimed.project_id,
                project_code=project_code,
                attempt=claimed.attempt,
                messages=list((claimed.request_payload or {}).get("messages", [])),
                generation=dict(claimed.generation or {}),
                response_schema=claimed.response_schema,
                created_at_epoch=claimed.created_at.timestamp(),
            )

        import time as _time

        job_queue_wait_seconds.observe(max(0.0, _time.time() - snapshot.created_at_epoch))
        return snapshot

    async def _run_inference(
        self, snapshot: JobSnapshot
    ) -> tuple[InferenceResult, dict[str, Any]]:
        temperature = float(snapshot.generation.get("temperature", self._settings.temperature_min))
        max_tokens = int(
            snapshot.generation.get("maxOutputTokens", self._settings.max_output_tokens)
        )
        top_p = snapshot.generation.get("topP")

        request = InferenceRequest(
            messages=snapshot.messages,
            temperature=temperature,
            max_output_tokens=max_tokens,
            top_p=float(top_p) if top_p is not None else None,
            json_schema=snapshot.response_schema,
        )

        last_error: ProcessingError | None = None
        attempts = self._settings.model_output_max_fix_attempts + 1
        for _ in range(attempts):
            worker_active_jobs.inc()
            async with self._inference_semaphore:
                try:
                    result = await self._model.generate(request)
                finally:
                    worker_active_jobs.dec()

            ollama_inference_duration_seconds.observe(result.duration_ms / 1000.0)
            if result.completion_tokens and result.duration_ms > 0:
                tokens_per_second.observe(
                    result.completion_tokens / (result.duration_ms / 1000.0)
                )

            try:
                payload = self._build_result_payload(snapshot, result)
                return result, payload
            except ProcessingError as exc:
                # Yalnizca cikti bicimi/sema hatalarinda yeniden dene.
                if exc.error_code not in {
                    ErrorCode.MODEL_OUTPUT_NOT_JSON,
                    ErrorCode.SCHEMA_VALIDATION_FAILED,
                }:
                    raise
                last_error = exc
                logger.info(
                    "model ciktisi gecersiz, yeniden deneniyor",
                    extra={"job_id": str(snapshot.id)},
                )

        assert last_error is not None
        raise last_error

    def _build_result_payload(
        self, snapshot: JobSnapshot, result: InferenceResult
    ) -> dict[str, Any]:
        if snapshot.response_schema is None:
            payload: dict[str, Any] = {"text": result.text}
        else:
            try:
                parsed = json.loads(result.text)
            except json.JSONDecodeError as exc:
                raise ProcessingError(
                    ErrorCode.MODEL_OUTPUT_NOT_JSON, "Model ciktisi gecerli JSON degil"
                ) from exc
            validate_output_against_schema(parsed, snapshot.response_schema)
            payload = parsed if isinstance(parsed, dict) else {"value": parsed}

        size = len(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
        if size > self._settings.max_result_bytes:
            raise ProcessingError(
                ErrorCode.RESULT_TOO_LARGE,
                f"Sonuc boyutu {self._settings.max_result_bytes} bayt sinirini asiyor",
            )
        return payload

    async def _complete(
        self,
        snapshot: JobSnapshot,
        result: InferenceResult,
        payload: dict[str, Any],
        correlation_id: str | None,
    ) -> None:
        async with self._db.session() as s:
            ok = await repo.complete_job(
                s,
                job_id=snapshot.id,
                worker_id=self._worker_id,
                result=payload,
                prompt_tokens=result.prompt_tokens,
                completion_tokens=result.completion_tokens,
                duration_ms=result.duration_ms,
            )
            if not ok:
                logger.warning(
                    "job tamamlanamadi (lease kaybedilmis olabilir), sonuc atildi",
                    extra={"job_id": str(snapshot.id)},
                )
                return
            await repo.finish_attempt(
                s,
                job_id=snapshot.id,
                attempt_number=snapshot.attempt,
                outcome="completed",
                prompt_tokens=result.prompt_tokens,
                completion_tokens=result.completion_tokens,
                duration_ms=result.duration_ms,
            )
            job = await repo.get_job(s, snapshot.id)
            assert job is not None
            topic, event_type, ev = events.completed_event(self._settings, job, correlation_id)
            repo.add_outbox(
                s,
                job_id=job.id,
                topic=topic,
                event_type=event_type.value,
                partition_key=str(job.id),
                payload=ev,
            )

        jobs_completed_total.labels(project=snapshot.project_code).inc()
        if result.prompt_tokens:
            prompt_tokens_total.labels(project=snapshot.project_code).inc(result.prompt_tokens)
        if result.completion_tokens:
            completion_tokens_total.labels(project=snapshot.project_code).inc(
                result.completion_tokens
            )
        import time as _time

        job_total_duration_seconds.observe(max(0.0, _time.time() - snapshot.created_at_epoch))
        logger.info("job tamamlandi", extra={"job_id": str(snapshot.id)})

    async def _handle_failure(
        self, snapshot: JobSnapshot, exc: ProcessingError, correlation_id: str | None
    ) -> None:
        if exc.transient and snapshot.attempt < self._settings.retry_max_attempts:
            delay = self._retry_delay(snapshot.attempt)
            next_retry = repo.utcnow() + timedelta(seconds=delay)
            async with self._db.session() as s:
                ok = await repo.mark_retry(
                    s,
                    job_id=snapshot.id,
                    worker_id=self._worker_id,
                    next_retry_at=next_retry,
                    error_code=exc.error_code.value,
                    error_message=exc.message,
                )
                if ok:
                    await repo.finish_attempt(
                        s,
                        job_id=snapshot.id,
                        attempt_number=snapshot.attempt,
                        outcome="retry",
                        error_code=exc.error_code.value,
                        error_message=exc.message,
                    )
                    job = await repo.get_job(s, snapshot.id)
                    assert job is not None
                    topic, event_type, ev = events.retry_event(self._settings, job, correlation_id)
                    repo.add_outbox(
                        s, job_id=job.id, topic=topic, event_type=event_type.value,
                        partition_key=str(job.id), payload=ev,
                    )
            jobs_retried_total.inc()
            logger.info(
                "job retry'a alindi",
                extra={
                    "job_id": str(snapshot.id),
                    "delay_s": delay,
                    "error_code": exc.error_code.value,
                },
            )
            return

        # Kalici hata VEYA max deneme asildi.
        is_dlq = exc.transient  # gecici ama deneme bitti -> DLQ
        status = JobStatus.DEAD_LETTER if is_dlq else JobStatus.FAILED
        async with self._db.session() as s:
            ok = await repo.mark_terminal_failure(
                s,
                job_id=snapshot.id,
                worker_id=self._worker_id,
                status=status,
                error_code=exc.error_code.value,
                error_message=exc.message,
            )
            if ok:
                await repo.finish_attempt(
                    s,
                    job_id=snapshot.id,
                    attempt_number=snapshot.attempt,
                    outcome=status.value.lower(),
                    error_code=exc.error_code.value,
                    error_message=exc.message,
                )
                job = await repo.get_job(s, snapshot.id)
                assert job is not None
                if status is JobStatus.DEAD_LETTER:
                    topic, event_type, ev = events.dead_letter_event(
                        self._settings, job, correlation_id
                    )
                else:
                    topic, event_type, ev = events.failed_event(self._settings, job, correlation_id)
                repo.add_outbox(
                    s, job_id=job.id, topic=topic, event_type=event_type.value,
                    partition_key=str(job.id), payload=ev,
                )

        if status is JobStatus.DEAD_LETTER:
            jobs_dlq_total.inc()
        jobs_failed_total.labels(project=snapshot.project_code).inc()
        logger.info(
            "job basarisiz",
            extra={
                "job_id": str(snapshot.id),
                "status": status.value,
                "error_code": exc.error_code.value,
            },
        )

    def _retry_delay(self, attempt: int) -> int:
        schedule = self._settings.retry_backoff_seconds
        if not schedule:
            return 10
        idx = min(max(attempt - 1, 0), len(schedule) - 1)
        return schedule[idx]

    async def _dead_letter_raw(self, raw: bytes) -> None:
        async with self._db.session() as s:
            repo.add_outbox(
                s,
                job_id=None,
                topic=self._settings.kafka_topic_dlq,
                event_type="malformed_message",
                partition_key="malformed",
                payload={
                    "reason": "malformed_message",
                    "rawLength": len(raw),
                },
            )
