"""Uygulama konfigurasyonu.

Tum ayarlar ortam degiskenlerinden okunur. Zorunlu degiskenler eksikse veya
degerler gecersizse uygulama baslangicta (fail-fast) hata vererek durur.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated

from pydantic import Field, computed_field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# Spec DATABASE_URL ornegi `postgresql+psycopg_async://` yazar; SQLAlchemy'nin
# gercek async psycopg3 dialect adi `postgresql+psycopg`. Her ikisini de kabul
# edip tek bir calisan forma normalize ediyoruz.
_SPEC_ASYNC_SCHEME = "postgresql+psycopg_async://"
_SA_ASYNC_SCHEME = "postgresql+psycopg://"


def _normalize_async_url(url: str) -> str:
    if url.startswith(_SPEC_ASYNC_SCHEME):
        return _SA_ASYNC_SCHEME + url[len(_SPEC_ASYNC_SCHEME) :]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Genel ---
    app_env: str = "development"
    log_level: str = "INFO"
    correlation_id_header: str = "X-Correlation-Id"

    # --- PostgreSQL ---
    database_url: str
    database_url_test: str | None = None
    db_pool_size: int = 5
    db_max_overflow: int = 5
    db_pool_timeout_seconds: int = 10
    db_command_timeout_seconds: int = 30

    # --- Kimlik dogrulama ---
    api_key_hmac_secret: str
    api_host: str = "0.0.0.0"
    api_port: int = 8080

    # --- Model saglayici / Ollama ---
    model_provider: str = "ollama"
    ollama_host: str = "http://ollama:11434"
    ollama_model: str = "gemma3:12b-it-q4_K_M"
    ollama_keep_alive: str = "30m"
    ollama_connect_timeout_seconds: float = 5.0
    ollama_timeout_seconds: float = 120.0
    ollama_max_connections: int = 10
    ollama_warmup: bool = False

    # --- Kafka ---
    kafka_bootstrap_servers: str = "kafka:9092"
    kafka_topic_requested: str = "ai.jobs.requested.v1"
    kafka_topic_events: str = "ai.jobs.events.v1"
    kafka_topic_dlq: str = "ai.jobs.dlq.v1"
    kafka_topic_partitions: int = 3
    kafka_topic_replication_factor: int = 1
    kafka_consumer_group: str = "ai-worker"
    kafka_max_poll_interval_ms: int = 600000
    kafka_session_timeout_ms: int = 45000
    kafka_heartbeat_interval_ms: int = 15000

    # --- Worker / inference ---
    max_concurrent_inference: int = 1
    worker_internal_queue_size: int = 10
    worker_lease_seconds: int = 120
    worker_heartbeat_seconds: int = 30
    model_output_max_fix_attempts: int = 1

    # --- Istek / girdi limitleri ---
    max_request_bytes: int = 65536
    max_messages: int = 50
    max_total_input_chars: int = 24000
    max_input_tokens: int = 6000
    max_output_tokens: int = 2048
    max_result_bytes: int = 131072
    temperature_min: float = 0.0
    temperature_max: float = 2.0
    max_response_schema_bytes: int = 8192
    max_response_schema_depth: int = 6
    max_response_schema_properties: int = 64

    # --- Backpressure / kapasite ---
    project_max_active_jobs: int = 50
    project_max_pending_jobs: int = 200
    global_max_pending_jobs: int = 2000

    # --- Outbox publisher ---
    outbox_batch_size: int = 100
    outbox_poll_interval_seconds: float = 1.0
    outbox_max_attempts: int = 20
    outbox_backoff_base_seconds: float = 1.0
    outbox_backoff_max_seconds: float = 60.0

    # --- Retry dispatcher ---
    retry_max_attempts: int = 3
    retry_backoff_seconds: Annotated[list[int], NoDecode] = Field(default=[10, 60, 300])
    retry_dispatcher_poll_interval_seconds: float = 5.0

    # --- Retention ---
    retention_days: int = 30
    retention_poll_interval_seconds: float = 3600.0

    # --- Metrikler ---
    metrics_port: int = 9100

    @field_validator("retry_backoff_seconds", mode="before")
    @classmethod
    def _parse_backoff(cls, value: object) -> object:
        if isinstance(value, str):
            parts = [p.strip() for p in value.split(",") if p.strip()]
            return [int(p) for p in parts]
        return value

    @field_validator("database_url", "database_url_test")
    @classmethod
    def _normalize_db_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _normalize_async_url(value)

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_production(self) -> bool:
        return self.app_env.lower() in {"production", "prod"}

    def require_test_database_url(self) -> str:
        if not self.database_url_test:
            raise RuntimeError(
                "DATABASE_URL_TEST tanimli degil. Integration/e2e testleri icin "
                "ai_platform_test veritabanini isaret eden bir URL saglayin."
            )
        return self.database_url_test


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Surec basina tekil Settings ornegi dondurur (fail-fast)."""

    return Settings()  # type: ignore[call-arg]
