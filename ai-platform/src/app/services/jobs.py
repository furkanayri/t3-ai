"""Job olusturma servisi (API tarafinda kullanilir).

Job kaydi + outbox kaydi AYNI kisa transaction'da yazilir ve commit edilir.
API model sonucunu beklemez. Idempotency ve backpressure burada uygulanir.
"""

from __future__ import annotations

import json
from typing import Any

from sqlalchemy.exc import IntegrityError

from app.config import Settings
from app.db import repositories as repo
from app.db.engine import Database
from app.db.models import Job, Project
from app.domain import events
from app.domain.enums import JobStatus
from app.domain.errors import BackpressureError, PayloadTooLargeError, RequestValidationError
from app.domain.schemas import CreateJobRequest
from app.domain.validation import validate_create_request
from app.logging import get_logger
from app.metrics import jobs_created_total, project_requests_total
from app.security.auth import AuthContext

logger = get_logger(__name__)


class JobService:
    def __init__(self, settings: Settings, db: Database):
        self._settings = settings
        self._db = db

    async def create_job(
        self,
        auth: AuthContext,
        req: CreateJobRequest,
        idempotency_key: str,
        correlation_id: str | None,
    ) -> tuple[Job, bool]:
        settings = self._settings

        async with self._db.session() as session:
            project = await session.get(Project, auth.project_id)
            if project is None:
                raise RequestValidationError("Proje bulunamadi")

            generation = validate_create_request(
                req, settings, project_max_output_tokens=project.max_output_tokens
            )

            # Idempotency: ayni (project, key) icin mevcut job'i don.
            existing = await repo.get_job_by_idempotency(session, auth.project_id, idempotency_key)
            if existing is not None:
                return existing, False

            # Backpressure: proje ve global kapasite.
            self._check_backpressure_params()
            active = await repo.count_project_active(session, auth.project_id)
            project_active_limit = project.max_active_jobs or settings.project_max_active_jobs
            if active >= project_active_limit:
                raise BackpressureError(
                    "Proje icin maksimum aktif job sinirina ulasildi", retry_after_seconds=2
                )

            pending = await repo.count_project_pending(session, auth.project_id)
            project_pending_limit = project.max_pending_jobs or settings.project_max_pending_jobs
            if pending >= project_pending_limit:
                raise BackpressureError(
                    "Proje icin maksimum bekleyen job sinirina ulasildi", retry_after_seconds=2
                )

            global_pending = await repo.count_global_pending(session)
            if global_pending >= settings.global_max_pending_jobs:
                raise BackpressureError(
                    "Sistem genel kapasitesi dolu", retry_after_seconds=5
                )

            request_payload = {"messages": [m.model_dump() for m in req.messages]}
            self._check_request_size(request_payload)

            job = Job(
                project_id=auth.project_id,
                idempotency_key=idempotency_key,
                status=JobStatus.QUEUED.value,
                request_payload=request_payload,
                response_schema=req.response_schema,
                generation=generation,
                model_provider=settings.model_provider,
                model_name=settings.ollama_model,
                attempt=0,
            )
            session.add(job)

            try:
                await session.flush()  # job.id uret
            except IntegrityError:
                # Eszamanli duplicate: mevcut kaydi don.
                await session.rollback()
                async with self._db.session() as s2:
                    existing = await repo.get_job_by_idempotency(
                        s2, auth.project_id, idempotency_key
                    )
                    if existing is not None:
                        return existing, False
                raise

            topic, event_type, payload = events.requested_event(settings, job, correlation_id)
            repo.add_outbox(
                session,
                job_id=job.id,
                topic=topic,
                event_type=event_type.value,
                partition_key=str(job.id),
                payload=payload,
            )
            # session context manager commit eder.

        jobs_created_total.labels(project=auth.project_code).inc()
        project_requests_total.labels(project=auth.project_code).inc()
        logger.info(
            "job olusturuldu",
            extra={"job_id": str(job.id), "project": auth.project_code, "status": job.status},
        )
        return job, True

    def _check_backpressure_params(self) -> None:
        # Degerler config'den gelir; burada ekstra bir dogrulama gerekmiyor.
        return None

    def _check_request_size(self, request_payload: dict[str, Any]) -> None:
        size = len(json.dumps(request_payload, ensure_ascii=False).encode("utf-8"))
        if size > self._settings.max_request_bytes:
            raise PayloadTooLargeError(
                f"Istek boyutu {self._settings.max_request_bytes} bayt sinirini asiyor"
            )
