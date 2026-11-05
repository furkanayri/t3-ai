"""Job endpoint'leri: olusturma (202) ve durum sorgulama."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_job_service, get_read_session, require_auth
from app.db import repositories as repo
from app.db.models import Job
from app.domain.enums import JobStatus
from app.domain.errors import NotFoundError
from app.domain.schemas import (
    CreateJobRequest,
    CreateJobResponse,
    JobError,
    JobExecution,
    JobStatusResponse,
)
from app.security.auth import AuthContext
from app.services.jobs import JobService

router = APIRouter(prefix="/v1", tags=["jobs"])


@router.post(
    "/jobs",
    status_code=202,
    response_model=CreateJobResponse,
    response_model_by_alias=True,
)
async def create_job(
    payload: CreateJobRequest,
    request: Request,
    idempotency_key: str = Header(alias="Idempotency-Key", min_length=1, max_length=200),
    auth: AuthContext = Depends(require_auth),
    service: JobService = Depends(get_job_service),
) -> CreateJobResponse:
    correlation_id = getattr(request.state, "correlation_id", None)
    job, _created = await service.create_job(auth, payload, idempotency_key, correlation_id)
    return CreateJobResponse(
        job_id=job.id,
        status=job.status,
        created_at=job.created_at,
        status_url=f"/v1/jobs/{job.id}",
    )


@router.get(
    "/jobs/{job_id}",
    response_model=JobStatusResponse,
    response_model_by_alias=True,
)
async def get_job(
    job_id: uuid.UUID,
    auth: AuthContext = Depends(require_auth),
    session: AsyncSession = Depends(get_read_session),
) -> JobStatusResponse:
    # Proje izolasyonu: yalnizca kendi projesine ait job'a erisilebilir.
    job = await repo.get_job_for_project(session, job_id, auth.project_id)
    if job is None:
        raise NotFoundError("Job bulunamadi")
    return _to_status_response(job)


def _to_status_response(job: Job) -> JobStatusResponse:
    execution: JobExecution | None = None
    if job.status == JobStatus.COMPLETED.value or job.duration_ms is not None:
        execution = JobExecution(
            provider=job.model_provider,
            model=job.model_name,
            prompt_tokens=job.prompt_tokens,
            completion_tokens=job.completion_tokens,
            duration_ms=job.duration_ms,
        )

    error: JobError | None = None
    if job.status in {JobStatus.FAILED.value, JobStatus.DEAD_LETTER.value} and job.error_code:
        error = JobError(code=job.error_code, message=job.error_message or "Islem basarisiz")

    # Request payload varsayilan olarak response'a EKLENMEZ.
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        created_at=job.created_at,
        updated_at=job.updated_at,
        result=job.result if job.status == JobStatus.COMPLETED.value else None,
        execution=execution,
        error=error,
    )
