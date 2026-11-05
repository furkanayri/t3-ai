"""LLM API HTTP entegrasyon testleri (auth, idempotency, izolasyon, backpressure)."""

from __future__ import annotations

import httpx
import pytest

from tests.conftest import ProjectKeyFactory, auth_headers, make_settings, new_idem

pytestmark = pytest.mark.integration

BODY = {"messages": [{"role": "user", "content": "Merhaba dunya"}]}


async def test_create_requires_auth(api_client: httpx.AsyncClient) -> None:
    resp = await api_client.post("/v1/jobs", json=BODY, headers={"Idempotency-Key": new_idem()})
    assert resp.status_code == 401
    assert resp.json()["code"] == "unauthorized"


async def test_create_invalid_key(api_client: httpx.AsyncClient) -> None:
    resp = await api_client.post(
        "/v1/jobs", json=BODY, headers=auth_headers("bozuk.anahtar", new_idem())
    )
    assert resp.status_code == 401


async def test_create_success_returns_202_queued(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key()
    resp = await api_client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    assert resp.status_code == 202
    data = resp.json()
    assert data["status"] == "QUEUED"
    assert "jobId" in data
    assert data["statusUrl"] == f"/v1/jobs/{data['jobId']}"
    # correlation id header dolu dondurulur.
    assert resp.headers.get("X-Correlation-Id")


async def test_create_requires_idempotency_key(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key()
    resp = await api_client.post("/v1/jobs", json=BODY, headers={"Authorization": f"Bearer {key}"})
    assert resp.status_code == 422


async def test_idempotency_returns_same_job(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key()
    idem = new_idem()
    first = await api_client.post("/v1/jobs", json=BODY, headers=auth_headers(key, idem))
    second = await api_client.post("/v1/jobs", json=BODY, headers=auth_headers(key, idem))
    assert first.status_code == 202
    assert second.status_code == 202
    assert first.json()["jobId"] == second.json()["jobId"]


async def test_get_job_status(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key()
    created = await api_client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    job_id = created.json()["jobId"]
    resp = await api_client.get(f"/v1/jobs/{job_id}", headers=auth_headers(key))
    assert resp.status_code == 200
    data = resp.json()
    assert data["jobId"] == job_id
    assert data["status"] == "QUEUED"
    # Istek payload'u varsayilan olarak DONDURULMEZ.
    assert "requestPayload" not in data
    assert "messages" not in data
    assert data["result"] is None


async def test_project_isolation(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _p_a, key_a = await make_project_key(code="proj-a")
    _p_b, key_b = await make_project_key(code="proj-b")
    created = await api_client.post("/v1/jobs", json=BODY, headers=auth_headers(key_a, new_idem()))
    job_id = created.json()["jobId"]
    # B projesi A'nin job'ini goremez.
    resp = await api_client.get(f"/v1/jobs/{job_id}", headers=auth_headers(key_b))
    assert resp.status_code == 404


async def test_get_nonexistent_job(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key()
    resp = await api_client.get(
        "/v1/jobs/00000000-0000-0000-0000-000000000000", headers=auth_headers(key)
    )
    assert resp.status_code == 404


async def test_empty_messages_rejected(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key()
    resp = await api_client.post(
        "/v1/jobs", json={"messages": []}, headers=auth_headers(key, new_idem())
    )
    assert resp.status_code == 422


async def test_invalid_response_schema_rejected(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key()
    body = {
        "messages": [{"role": "user", "content": "x"}],
        "responseSchema": {"type": "object", "patternProperties": {".*": {"type": "string"}}},
    }
    resp = await api_client.post("/v1/jobs", json=body, headers=auth_headers(key, new_idem()))
    assert resp.status_code == 422


async def test_disabled_key_rejected(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key(client_active=False)
    resp = await api_client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    assert resp.status_code == 401


async def test_expired_key_rejected(
    api_client: httpx.AsyncClient, make_project_key: ProjectKeyFactory
) -> None:
    _project, key = await make_project_key(expired=True)
    resp = await api_client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    assert resp.status_code == 401


async def test_backpressure_returns_429(
    api_client_factory,  # type: ignore[no-untyped-def]
    make_project_key: ProjectKeyFactory,
) -> None:
    settings = make_settings(project_max_pending_jobs=1)
    client = await api_client_factory(settings)
    _project, key = await make_project_key()
    first = await client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    assert first.status_code == 202
    second = await client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    assert second.status_code == 429
    assert second.headers.get("Retry-After") is not None
    assert second.json()["code"] == "capacity_exceeded"
