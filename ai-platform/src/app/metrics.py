"""Prometheus uyumlu metrik tanimlari.

Yuksek cardinality'den kacinmak icin job id, prompt veya kullanici girdisi label
olarak KULLANILMAZ. project_code gibi sayica sinirli degerler label olabilir.
"""

from __future__ import annotations

from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram, generate_latest

# Tum process'lerin paylastigi tekil registry.
REGISTRY = CollectorRegistry(auto_describe=True)

_LATENCY_BUCKETS = (
    0.005,
    0.01,
    0.025,
    0.05,
    0.1,
    0.25,
    0.5,
    1.0,
    2.5,
    5.0,
    10.0,
    30.0,
    60.0,
    120.0,
    300.0,
)

# --- API ---
api_requests_total = Counter(
    "api_requests_total",
    "Toplam API istek sayisi",
    ["method", "path", "status"],
    registry=REGISTRY,
)
api_request_duration_seconds = Histogram(
    "api_request_duration_seconds",
    "API yanit suresi (p50/p95/p99 icin)",
    ["method", "path"],
    buckets=_LATENCY_BUCKETS,
    registry=REGISTRY,
)

# --- Job yasam dongusu ---
jobs_created_total = Counter(
    "jobs_created_total", "Olusturulan job sayisi", ["project"], registry=REGISTRY
)
jobs_completed_total = Counter(
    "jobs_completed_total", "Tamamlanan job sayisi", ["project"], registry=REGISTRY
)
jobs_failed_total = Counter(
    "jobs_failed_total", "Basarisiz job sayisi", ["project"], registry=REGISTRY
)
jobs_retried_total = Counter("jobs_retried_total", "Retry sayisi", registry=REGISTRY)
jobs_dlq_total = Counter("jobs_dlq_total", "DLQ (dead letter) sayisi", registry=REGISTRY)

job_queue_wait_seconds = Histogram(
    "job_queue_wait_seconds",
    "Job olusturma ile worker islemeye baslama arasi (Kafka bekleme) suresi",
    buckets=_LATENCY_BUCKETS,
    registry=REGISTRY,
)
job_total_duration_seconds = Histogram(
    "job_total_duration_seconds",
    "Toplam job suresi (olusturma -> tamamlanma)",
    buckets=_LATENCY_BUCKETS,
    registry=REGISTRY,
)

# --- Kafka ---
kafka_consumer_lag = Gauge(
    "kafka_consumer_lag",
    "Kafka consumer lag (partition basina)",
    ["topic", "partition"],
    registry=REGISTRY,
)
kafka_rebalance_total = Counter(
    "kafka_rebalance_total", "Kafka consumer rebalance sayisi", registry=REGISTRY
)

# --- Worker / inference ---
worker_active_jobs = Gauge(
    "worker_active_jobs", "Worker'da su an islenen job sayisi", registry=REGISTRY
)
worker_queue_fill = Gauge(
    "worker_queue_fill", "Worker internal queue doluluk (eleman sayisi)", registry=REGISTRY
)
worker_queue_capacity = Gauge(
    "worker_queue_capacity", "Worker internal queue kapasitesi", registry=REGISTRY
)
ollama_inference_duration_seconds = Histogram(
    "ollama_inference_duration_seconds",
    "Ollama inference suresi (p50/p95/p99 icin)",
    buckets=_LATENCY_BUCKETS,
    registry=REGISTRY,
)
prompt_tokens_total = Counter(
    "prompt_tokens_total", "Toplam prompt token", ["project"], registry=REGISTRY
)
completion_tokens_total = Counter(
    "completion_tokens_total", "Toplam completion token", ["project"], registry=REGISTRY
)
tokens_per_second = Histogram(
    "tokens_per_second",
    "Inference basina saniyedeki uretilen token",
    buckets=(1, 2, 5, 10, 20, 40, 60, 80, 100, 150, 200, 400),
    registry=REGISTRY,
)

# --- PostgreSQL / Outbox ---
db_pool_connections = Gauge(
    "db_pool_connections",
    "PostgreSQL baglanti havuzu durumu",
    ["state"],  # checkedout (aktif) / checkedin (bekleyen) / overflow
    registry=REGISTRY,
)
outbox_pending = Gauge(
    "outbox_pending", "Yayinlanmayi bekleyen outbox kaydi sayisi", registry=REGISTRY
)

# --- Project bazli istek/token ---
project_requests_total = Counter(
    "project_requests_total", "Project bazli kabul edilen istek sayisi", ["project"],
    registry=REGISTRY,
)


def render() -> bytes:
    """Prometheus text-format ciktisi uretir."""

    return generate_latest(REGISTRY)
