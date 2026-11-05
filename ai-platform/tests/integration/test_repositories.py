"""Repository atomik claim/lease ve kapasite sayaci entegrasyon testleri."""

from __future__ import annotations

import asyncio

import pytest

from app.db import repositories as repo
from app.db.engine import Database
from tests.conftest import JobFactory, ProjectKeyFactory, read_job

pytestmark = pytest.mark.integration


async def test_atomic_claim_single_winner(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    """Iki worker ayni job'i eszamanli sahiplenmeye calisirsa yalnizca biri kazanir."""

    project, _ = await make_project_key()
    job_id = await make_job(project)

    async def claim(worker: str) -> bool:
        async with database.begin() as s:
            claimed = await repo.claim_job(s, job_id, worker, 60)
            return claimed is not None

    results = await asyncio.gather(claim("w1"), claim("w2"))
    assert sum(1 for r in results if r) == 1

    job = await read_job(database, job_id)
    assert job.status == "RUNNING"
    assert job.attempt == 1  # yalnizca bir kez artti


async def test_claim_terminal_job_returns_none(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project, status="COMPLETED")
    async with database.begin() as s:
        claimed = await repo.claim_job(s, job_id, "w1", 60)
    assert claimed is None


async def test_claim_increments_attempt_and_sets_started(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    async with database.begin() as s:
        claimed = await repo.claim_job(s, job_id, "w1", 60)
        assert claimed is not None
        assert claimed.attempt == 1
        assert claimed.status == "RUNNING"
        assert claimed.worker_id == "w1"
        assert claimed.started_at is not None
        assert claimed.lease_until is not None


async def test_renew_lease(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    async with database.begin() as s:
        await repo.claim_job(s, job_id, "w1", 60)
    async with database.session() as s:
        ok = await repo.renew_lease(s, job_id, "w1", 120)
    assert ok is True
    # Yanlis worker lease yenileyemez.
    async with database.session() as s:
        bad = await repo.renew_lease(s, job_id, "baska-worker", 120)
    assert bad is False


async def test_capacity_counts(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    await make_job(project, status="QUEUED")
    await make_job(project, status="RUNNING")
    await make_job(project, status="RETRY")
    await make_job(project, status="COMPLETED")

    async with database.session() as s:
        active = await repo.count_project_active(s, project.id)
        pending = await repo.count_project_pending(s, project.id)
        global_pending = await repo.count_global_pending(s)

    assert active == 3  # QUEUED + RUNNING + RETRY
    assert pending == 2  # QUEUED + RETRY
    assert global_pending == 2


async def test_idempotency_lookup(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project, idempotency_key="abc-123")
    async with database.session() as s:
        found = await repo.get_job_by_idempotency(s, project.id, "abc-123")
        missing = await repo.get_job_by_idempotency(s, project.id, "yok")
    assert found is not None
    assert found.id == job_id
    assert missing is None


async def test_purge_expired_payloads(
    database: Database, make_project_key: ProjectKeyFactory, make_job: JobFactory
) -> None:
    from datetime import timedelta

    project, _ = await make_project_key()
    job_id = await make_job(project, status="COMPLETED")

    async with database.session() as s:
        purged = await repo.purge_expired_payloads(s, older_than=repo.utcnow() + timedelta(days=1))
    assert purged == 1

    job = await read_job(database, job_id)
    assert job.request_payload is None
    assert job.purged_at is not None
