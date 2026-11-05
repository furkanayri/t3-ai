"""Ortak test fikstur'leri.

Integration/e2e testleri ai_platform_test veritabanini kullanir (gelistirme
veritabanina dokunulmaz). PostgreSQL erisilemezse bu testler atlanir.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import uuid
from collections.abc import AsyncIterator, Awaitable, Callable, Iterator
from datetime import UTC, datetime, timedelta

# Windows'ta psycopg async yalnizca SelectorEventLoop ile calisir (varsayilan
# ProactorEventLoop desteklenmez). Loop olusturulmadan once policy ayarlanir.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import text

from app.config import Settings
from app.db.engine import Database
from app.db.models import ApiClient, Job, Project
from app.db.repositories import utcnow
from app.kafka.consumer import ConsumerMessage
from app.llm.ollama import OllamaClient
from app.security.api_key import generate_api_key
from app.security.auth import AuthContext
from app.services.jobs import JobService
from app.services.worker import JobProcessor
from tests.mock_ollama import MockOllama

DEFAULT_TEST_DB_URL = (
    "postgresql+psycopg://ai_platform_user:testpass@localhost:5432/ai_platform_test"
)

TEST_DB_URL = os.environ.get("AI_PLATFORM_TEST_DATABASE_URL", DEFAULT_TEST_DB_URL)

_TABLES = ["outbox", "job_attempts", "jobs", "api_clients", "projects"]


def make_settings(**overrides: object) -> Settings:
    base: dict[str, object] = {
        "database_url": TEST_DB_URL,
        "api_key_hmac_secret": "test-hmac-secret",
        "model_provider": "ollama",
        "ollama_model": "gemma3:4b-it-q4_K_M",
    }
    base.update(overrides)
    return Settings(**base)  # type: ignore[arg-type]


@pytest.fixture
def settings() -> Settings:
    return make_settings()


@pytest_asyncio.fixture
async def database(settings: Settings) -> AsyncIterator[Database]:
    db = Database(settings)
    try:
        await db.healthcheck()
    except Exception as exc:  # noqa: BLE001
        await db.dispose()
        pytest.skip(f"PostgreSQL test veritabanina erisilemiyor: {exc}")
    async with db.engine.begin() as conn:
        await conn.execute(text(f"TRUNCATE {', '.join(_TABLES)} RESTART IDENTITY CASCADE"))
    yield db
    await db.dispose()


@pytest.fixture
def mock_ollama() -> Iterator[MockOllama]:
    server = MockOllama()
    server.start()
    try:
        yield server
    finally:
        server.stop()


ProjectKeyFactory = Callable[..., Awaitable[tuple[Project, str]]]


@pytest_asyncio.fixture
async def make_project_key(settings: Settings, database: Database) -> ProjectKeyFactory:
    async def _factory(
        code: str = "heplin",
        name: str = "Heplin",
        *,
        is_active: bool = True,
        client_active: bool = True,
        revoked: bool = False,
        expired: bool = False,
        **project_overrides: object,
    ) -> tuple[Project, str]:
        async with database.session() as s:
            project = Project(code=code, name=name, is_active=is_active, **project_overrides)
            s.add(project)
            await s.flush()
            generated = generate_api_key(settings.api_key_hmac_secret)
            client = ApiClient(
                id=generated.key_id,
                project_id=project.id,
                name="test-key",
                secret_hash=generated.secret_hash,
                is_active=client_active,
                revoked_at=utcnow() if revoked else None,
                expires_at=(utcnow() - timedelta(days=1)) if expired else None,
            )
            s.add(client)
            await s.flush()
            await s.refresh(project)
            project_obj = project
            full_key = generated.full_key
        return project_obj, full_key

    return _factory


JobFactory = Callable[..., Awaitable[uuid.UUID]]


@pytest_asyncio.fixture
async def make_job(database: Database) -> JobFactory:
    async def _factory(
        project: Project,
        *,
        messages: list[dict[str, str]] | None = None,
        response_schema: dict | None = None,
        generation: dict | None = None,
        status: str = "QUEUED",
        attempt: int = 0,
        worker_id: str | None = None,
        lease_until: datetime | None = None,
        next_retry_at: datetime | None = None,
        idempotency_key: str | None = None,
    ) -> uuid.UUID:
        async with database.session() as s:
            job = Job(
                project_id=project.id,
                idempotency_key=idempotency_key or uuid.uuid4().hex,
                status=status,
                request_payload={
                    "messages": messages or [{"role": "user", "content": "selam"}]
                },
                response_schema=response_schema,
                generation=generation or {"temperature": 0.0, "maxOutputTokens": 128},
                model_provider="ollama",
                model_name="gemma3:4b-it-q4_K_M",
                attempt=attempt,
                worker_id=worker_id,
                lease_until=lease_until,
                next_retry_at=next_retry_at,
            )
            s.add(job)
            await s.flush()
            job_id = job.id
        return job_id

    return _factory


ProcessorFactory = Callable[[Settings], JobProcessor]


@pytest_asyncio.fixture
async def make_processor(database: Database) -> AsyncIterator[ProcessorFactory]:
    clients: list[OllamaClient] = []

    def _factory(settings: Settings, *, worker_id: str = "worker-1") -> JobProcessor:
        client = OllamaClient(settings)
        clients.append(client)
        return JobProcessor(settings, database, client, worker_id=worker_id)

    yield _factory
    for client in clients:
        await client.aclose()


def build_consumer_message(
    job_id: uuid.UUID,
    project_id: uuid.UUID,
    *,
    attempt: int = 0,
    correlation_id: str | None = "test-cid",
    event_type: str = "job.requested",
    topic: str = "ai.jobs.requested.v1",
    offset: int = 0,
    partition: int = 0,
) -> ConsumerMessage:
    payload = {
        "eventId": uuid.uuid4().hex,
        "eventType": event_type,
        "eventVersion": "1",
        "jobId": str(job_id),
        "projectId": str(project_id),
        "attempt": attempt,
        "correlationId": correlation_id,
        "createdAt": datetime.now(tz=UTC).isoformat(),
    }
    return ConsumerMessage(
        topic=topic,
        partition=partition,
        offset=offset,
        key=str(job_id),
        value=json.dumps(payload).encode("utf-8"),
    )


async def read_job(database: Database, job_id: uuid.UUID) -> Job:
    async with database.session() as s:
        job = await s.get(Job, job_id)
        assert job is not None
        await s.refresh(job)
        return job


def auth_context_for(project: Project, client_id: uuid.UUID | None = None) -> AuthContext:
    return AuthContext(
        project_id=project.id,
        project_code=project.code,
        api_client_id=client_id or uuid.uuid4(),
    )


@pytest.fixture
def job_service(settings: Settings, database: Database) -> JobService:
    return JobService(settings, database)


def _build_app(settings: Settings, database: Database):  # type: ignore[no-untyped-def]
    from app.api.app import create_app

    app = create_app(settings=settings, database=database)
    app.state.settings = settings
    app.state.db = database
    app.state.job_service = JobService(settings, database)
    return app


@pytest_asyncio.fixture
async def api_client(
    settings: Settings, database: Database
) -> AsyncIterator[httpx.AsyncClient]:
    app = _build_app(settings, database)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest_asyncio.fixture
async def api_client_factory(
    database: Database,
) -> AsyncIterator[Callable[[Settings], Awaitable[httpx.AsyncClient]]]:
    from contextlib import AsyncExitStack

    stack = AsyncExitStack()

    async def _factory(settings: Settings) -> httpx.AsyncClient:
        app = _build_app(settings, database)
        transport = httpx.ASGITransport(app=app)
        return await stack.enter_async_context(
            httpx.AsyncClient(transport=transport, base_url="http://testserver")
        )

    yield _factory
    await stack.aclose()


def auth_headers(api_key: str, idempotency_key: str | None = None) -> dict[str, str]:
    headers = {"Authorization": f"Bearer {api_key}"}
    if idempotency_key is not None:
        headers["Idempotency-Key"] = idempotency_key
    return headers


def new_idem() -> str:
    return uuid.uuid4().hex
