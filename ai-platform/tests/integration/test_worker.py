"""AI Worker isleme entegrasyon testleri (mock Ollama ile; gercek model yok)."""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import select

from app.db.engine import Database
from app.db.models import JobAttempt, OutboxMessage
from tests.conftest import (
    JobFactory,
    ProcessorFactory,
    ProjectKeyFactory,
    build_consumer_message,
    make_settings,
    read_job,
)
from tests.mock_ollama import MockOllama

pytestmark = pytest.mark.integration

SCHEMA = {
    "type": "object",
    "properties": {"answer": {"type": "string"}},
    "required": ["answer"],
}


async def _outbox_for_job(database: Database, job_id: uuid.UUID) -> list[OutboxMessage]:
    async with database.session() as s:
        rows = (
            await s.execute(select(OutboxMessage).where(OutboxMessage.job_id == job_id))
        ).scalars().all()
        return list(rows)


async def _attempts_for_job(database: Database, job_id: uuid.UUID) -> list[JobAttempt]:
    async with database.session() as s:
        rows = (
            await s.execute(select(JobAttempt).where(JobAttempt.job_id == job_id))
        ).scalars().all()
        return list(rows)


async def test_worker_completes_text_job(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    mock_ollama.state.response_text = "merhaba"

    settings = make_settings(ollama_host=mock_ollama.url)
    proc = make_processor(settings)
    ok = await proc.handle(build_consumer_message(job_id, project.id))
    assert ok is True

    job = await read_job(database, job_id)
    assert job.status == "COMPLETED"
    assert job.result == {"text": "merhaba"}
    assert job.prompt_tokens == 12
    assert job.completion_tokens == 7
    assert job.duration_ms is not None

    outbox = await _outbox_for_job(database, job_id)
    assert any(m.event_type == "job.completed" and m.topic == settings.kafka_topic_events
               for m in outbox)
    attempts = await _attempts_for_job(database, job_id)
    assert len(attempts) == 1
    assert attempts[0].outcome == "completed"


async def test_worker_structured_output(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project, response_schema=SCHEMA)
    mock_ollama.state.response_text = '{"answer": "42"}'

    proc = make_processor(make_settings(ollama_host=mock_ollama.url))
    await proc.handle(build_consumer_message(job_id, project.id))

    job = await read_job(database, job_id)
    assert job.status == "COMPLETED"
    assert job.result == {"answer": "42"}


async def test_worker_non_json_output_fails_permanently(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project, response_schema=SCHEMA)
    mock_ollama.state.response_text = "bu gecerli JSON degil"

    proc = make_processor(make_settings(ollama_host=mock_ollama.url))
    await proc.handle(build_consumer_message(job_id, project.id))

    job = await read_job(database, job_id)
    assert job.status == "FAILED"
    assert job.error_code == "model_output_not_json"
    # model_output_max_fix_attempts=1 -> 2 deneme yapilir.
    assert mock_ollama.state.call_count == 2


async def test_worker_schema_mismatch_fails_permanently(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project, response_schema=SCHEMA)
    mock_ollama.state.response_text = '{"baska": "alan"}'  # 'answer' eksik

    proc = make_processor(make_settings(ollama_host=mock_ollama.url))
    await proc.handle(build_consumer_message(job_id, project.id))

    job = await read_job(database, job_id)
    assert job.status == "FAILED"
    assert job.error_code == "schema_validation_failed"


async def test_worker_timeout_goes_to_retry(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    mock_ollama.state.latency_seconds = 1.0

    settings = make_settings(
        ollama_host=mock_ollama.url, ollama_timeout_seconds=0.3, retry_max_attempts=3
    )
    proc = make_processor(settings)
    await proc.handle(build_consumer_message(job_id, project.id))

    job = await read_job(database, job_id)
    assert job.status == "RETRY"
    assert job.error_code == "ollama_timeout"
    assert job.next_retry_at is not None
    assert job.worker_id is None  # retry'da lease serbest birakilir


async def test_worker_transient_exhausted_goes_to_dlq(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project)
    mock_ollama.state.status_code = 503  # kalici gecici-hata

    settings = make_settings(ollama_host=mock_ollama.url, retry_max_attempts=1)
    proc = make_processor(settings)
    await proc.handle(build_consumer_message(job_id, project.id))

    job = await read_job(database, job_id)
    assert job.status == "DEAD_LETTER"
    assert job.error_code == "ollama_unavailable"

    outbox = await _outbox_for_job(database, job_id)
    assert any(m.topic == settings.kafka_topic_dlq and m.event_type == "job.dead_letter"
               for m in outbox)


async def test_worker_duplicate_delivery_is_idempotent(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    """Ayni mesaj iki kez gelirse model yalnizca BIR kez cagrilir (crash-safety)."""

    project, _ = await make_project_key()
    job_id = await make_job(project)
    mock_ollama.state.response_text = "tek sefer"

    settings = make_settings(ollama_host=mock_ollama.url)
    proc = make_processor(settings)
    cm = build_consumer_message(job_id, project.id)

    assert await proc.handle(cm) is True
    assert await proc.handle(cm) is True  # tekrar teslim

    assert mock_ollama.state.call_count == 1
    job = await read_job(database, job_id)
    assert job.status == "COMPLETED"
    assert job.result == {"text": "tek sefer"}
    attempts = await _attempts_for_job(database, job_id)
    assert len(attempts) == 1


async def test_worker_skips_already_terminal_job(
    database: Database,
    make_project_key: ProjectKeyFactory,
    make_job: JobFactory,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    project, _ = await make_project_key()
    job_id = await make_job(project, status="COMPLETED")

    proc = make_processor(make_settings(ollama_host=mock_ollama.url))
    assert await proc.handle(build_consumer_message(job_id, project.id)) is True
    assert mock_ollama.state.call_count == 0


async def test_worker_malformed_message_to_dlq(
    database: Database,
    make_processor: ProcessorFactory,
    mock_ollama: MockOllama,
) -> None:
    from app.kafka.consumer import ConsumerMessage

    settings = make_settings(ollama_host=mock_ollama.url)
    proc = make_processor(settings)
    bad = ConsumerMessage(
        topic="ai.jobs.requested.v1",
        partition=0,
        offset=0,
        key="x",
        value=b'{"eksik": "alanlar"}',
    )
    assert await proc.handle(bad) is True
    assert mock_ollama.state.call_count == 0

    async with database.session() as s:
        rows = (
            await s.execute(
                select(OutboxMessage).where(OutboxMessage.event_type == "malformed_message")
            )
        ).scalars().all()
    assert len(list(rows)) == 1
    assert list(rows)[0].topic == settings.kafka_topic_dlq
