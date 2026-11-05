"""Uctan uca akis testi.

Gercek Kafka broker'i yerine FakeProducer kullanilir; ancak outbox'in uretip
producer'a verdigi GERCEK mesaj bayt'lari worker'a beslenir. Boylece
API -> outbox -> (kafka mesaj formati) -> worker -> mock Ollama -> sonuc -> API
zinciri butunuyle dogrulanir. Gercek model/GPU calistirilmaz.
"""

from __future__ import annotations

import pytest

from app.db.engine import Database
from app.kafka.consumer import ConsumerMessage
from app.services.outbox import OutboxPublisher
from tests.conftest import (
    ProcessorFactory,
    ProjectKeyFactory,
    auth_headers,
    make_settings,
    new_idem,
)
from tests.fakes import FakeProducer
from tests.mock_ollama import MockOllama

pytestmark = [pytest.mark.e2e, pytest.mark.integration]

BODY = {"messages": [{"role": "user", "content": "Merhaba, kendini tanit."}]}


async def _drain_to_worker(producer: FakeProducer, proc) -> None:  # type: ignore[no-untyped-def]
    for topic, key, value, _mid in producer.sent:
        cm = ConsumerMessage(topic=topic, partition=0, offset=0, key=key, value=value)
        assert await proc.handle(cm) is True


async def test_end_to_end_text_job(
    database: Database,
    api_client_factory,  # type: ignore[no-untyped-def]
    make_processor: ProcessorFactory,
    make_project_key: ProjectKeyFactory,
    mock_ollama: MockOllama,
) -> None:
    settings = make_settings(ollama_host=mock_ollama.url)
    client = await api_client_factory(settings)
    _project, key = await make_project_key()
    mock_ollama.state.response_text = "Ben bir yapay zeka asistaniyim."

    # 1) Job olustur -> 202 (API model sonucunu BEKLEMEZ)
    created = await client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    assert created.status_code == 202
    job_id = created.json()["jobId"]

    # 2) Hemen sorgula -> henuz QUEUED
    queued = await client.get(f"/v1/jobs/{job_id}", headers=auth_headers(key))
    assert queued.json()["status"] == "QUEUED"

    # 3) Outbox publisher requested olayini yayinlar (FakeProducer yakalar)
    producer = FakeProducer()
    publisher = OutboxPublisher(settings, database, producer)
    assert await publisher.run_once() == 1
    assert producer.sent_topics == [settings.kafka_topic_requested]

    # 4) Gercek mesaj bayt'lari worker'a beslenir
    proc = make_processor(settings)
    await _drain_to_worker(producer, proc)

    # 5) Sonuc API uzerinden okunur
    done = await client.get(f"/v1/jobs/{job_id}", headers=auth_headers(key))
    data = done.json()
    assert data["status"] == "COMPLETED"
    assert data["result"] == {"text": "Ben bir yapay zeka asistaniyim."}
    assert data["execution"]["provider"] == "ollama"
    assert data["execution"]["model"] == settings.ollama_model

    # 6) Tamamlanma olayi da yayinlanabilir
    producer2 = FakeProducer()
    publisher2 = OutboxPublisher(settings, database, producer2)
    assert await publisher2.run_once() == 1
    assert producer2.sent_topics == [settings.kafka_topic_events]


async def test_end_to_end_structured_output(
    database: Database,
    api_client_factory,  # type: ignore[no-untyped-def]
    make_processor: ProcessorFactory,
    make_project_key: ProjectKeyFactory,
    mock_ollama: MockOllama,
) -> None:
    settings = make_settings(ollama_host=mock_ollama.url)
    client = await api_client_factory(settings)
    _project, key = await make_project_key()
    mock_ollama.state.response_text = '{"sehir": "Istanbul", "nufus": 15000000}'

    body = {
        "messages": [{"role": "user", "content": "En kalabalik sehir?"}],
        "responseSchema": {
            "type": "object",
            "properties": {
                "sehir": {"type": "string"},
                "nufus": {"type": "integer"},
            },
            "required": ["sehir", "nufus"],
        },
    }
    created = await client.post("/v1/jobs", json=body, headers=auth_headers(key, new_idem()))
    assert created.status_code == 202
    job_id = created.json()["jobId"]

    producer = FakeProducer()
    assert await OutboxPublisher(settings, database, producer).run_once() == 1

    proc = make_processor(settings)
    await _drain_to_worker(producer, proc)

    done = await client.get(f"/v1/jobs/{job_id}", headers=auth_headers(key))
    data = done.json()
    assert data["status"] == "COMPLETED"
    assert data["result"] == {"sehir": "Istanbul", "nufus": 15000000}


async def test_end_to_end_failure_surfaces_in_api(
    database: Database,
    api_client_factory,  # type: ignore[no-untyped-def]
    make_processor: ProcessorFactory,
    make_project_key: ProjectKeyFactory,
    mock_ollama: MockOllama,
) -> None:
    settings = make_settings(ollama_host=mock_ollama.url, retry_max_attempts=1)
    client = await api_client_factory(settings)
    _project, key = await make_project_key()
    mock_ollama.state.status_code = 503  # kalici gecici-hata -> DLQ

    created = await client.post("/v1/jobs", json=BODY, headers=auth_headers(key, new_idem()))
    job_id = created.json()["jobId"]

    producer = FakeProducer()
    assert await OutboxPublisher(settings, database, producer).run_once() == 1

    proc = make_processor(settings)
    await _drain_to_worker(producer, proc)

    done = await client.get(f"/v1/jobs/{job_id}", headers=auth_headers(key))
    data = done.json()
    assert data["status"] == "DEAD_LETTER"
    assert data["error"]["code"] == "ollama_unavailable"
