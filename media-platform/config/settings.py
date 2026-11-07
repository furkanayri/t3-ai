"""Runtime configuration.

document_control config/settings/features.py'deki engine sabitleri + Faz 2
kontrol-duzlemi ayarlari. Engine dosyalari `from config.settings import settings`
ile bu objeye erisir (document_control'deki `from django.conf import settings`
yerine). Varsayilanlar sunucusuzdur: SQLite + in-memory ephemeral/kuyruk; Redis /
Postgres / RabbitMQ yalnizca ilgili ortam degiskeni verilince devreye girer.
"""

import os
from pathlib import Path
from types import SimpleNamespace

INSTANCE_DIR = Path(__file__).resolve().parents[1] / ".instance"


def _int(name, default):
    try:
        return int(os.environ.get(name, default))
    except (TypeError, ValueError):
        return int(default)


def _verified_profiles():
    raw = os.environ.get("VERIFIED_PROFILES")
    if raw:
        return {item.strip() for item in raw.split(",") if item.strip()}
    # Faz 1'de parity ile dogrulanan dijital-PDF profilleri.
    return {"STUDENT:student-documents-v5", "CRIMINAL_RECORD:criminal-record-v2"}


settings = SimpleNamespace(
    # --- Engine sabitleri (document_control ile birebir) ---
    MAX_PDF_BYTES=20 * 1024 * 1024,
    MAX_PDF_PAGES=20,
    MAX_ARTIFACT_BYTES=32 * 1024 * 1024,
    # --- Ephemeral (orijinal byte'lar: kalici degil) ---
    EPHEMERAL_REDIS_URL=os.environ.get("EPHEMERAL_REDIS_URL", ""),
    EPHEMERAL_TTL_SECONDS=_int("EPHEMERAL_TTL_SECONDS", 900),
    # --- Turetilmis sealed sonuc: kisa TTL, teslimde silinir ---
    RESULT_TTL_SECONDS=_int("RESULT_TTL_SECONDS", 3600),
    # --- Durum deposu ---
    DATABASE_URL=os.environ.get("DATABASE_URL", "sqlite+pysqlite:///:memory:"),
    # --- Dogrulanmis profiller (PROFILE_NOT_VERIFIED kapisi) ---
    VERIFIED_PROFILES=_verified_profiles(),
    # --- Lease sureleri (saniye) ---
    LEASE_SECONDS=_int("LEASE_SECONDS", 120),
    OCR_LEASE_SECONDS=_int("OCR_LEASE_SECONDS", 960),
    # --- Kimlik/sealing dosyalari (bootstrap dev'de uretir) ---
    KEYRING_FILE=os.environ.get("KEYRING_FILE", ""),
    SERVICE_TOKENS_FILE=os.environ.get("SERVICE_TOKENS_FILE", ""),
    # --- OCR motoru (Faz 3): tesseract (baseline) | gpu (PaddleOCR) ---
    OCR_ENGINE=os.environ.get("OCR_ENGINE", "tesseract"),
    PADDLE_USE_GPU=os.environ.get("PADDLE_USE_GPU", "1") == "1",
    PADDLE_LANG=os.environ.get("PADDLE_LANG", "tr"),
    # Local-only: model agirliklari vendor'lanir; runtime indirme YOK. Bos ise
    # gpu_ocr OCR_MODELS_MISSING verir (indirmeye izin vermez).
    PADDLE_DET_DIR=os.environ.get("PADDLE_DET_DIR", ""),
    PADDLE_REC_DIR=os.environ.get("PADDLE_REC_DIR", ""),
    PADDLE_CLS_DIR=os.environ.get("PADDLE_CLS_DIR", ""),
    # OCR yolu accuracy kapisi (parity degil): korpus + kabul esigi.
    OCR_ACCEPT_THRESHOLD=float(os.environ.get("OCR_ACCEPT_THRESHOLD", "0.95")),
    OCR_CORPUS_DIR=os.environ.get("OCR_CORPUS_DIR", ""),
    # --- Medya/ASR (Faz 4) ---
    FFMPEG_BINARY=os.environ.get("FFMPEG_BINARY", "ffmpeg"),
    # faster-whisper: local, vendor'lanmis model; runtime indirme YOK.
    ASR_MODEL_DIR=os.environ.get("ASR_MODEL_DIR", ""),
    ASR_DEVICE=os.environ.get("ASR_DEVICE", "cuda"),
    ASR_COMPUTE_TYPE=os.environ.get("ASR_COMPUTE_TYPE", "float16"),
    ASR_BEAM_SIZE=_int("ASR_BEAM_SIZE", 5),
    ASR_LANGUAGE=os.environ.get("ASR_LANGUAGE", "tr"),
    MEDIA_MAX_CHUNK_SEC=float(os.environ.get("MEDIA_MAX_CHUNK_SEC", "20")),
    # Buyuk video/ses ephemeral tier (seam): bos ise in-memory/Redis.
    EPHEMERAL_S3_ENDPOINT=os.environ.get("EPHEMERAL_S3_ENDPOINT", ""),
    EPHEMERAL_S3_BUCKET=os.environ.get("EPHEMERAL_S3_BUCKET", ""),
    # --- Faz 5: multi-tenant kota varsayilanlari (tenant_config override eder) ---
    DEFAULT_TENANT_CONCURRENCY=_int("DEFAULT_TENANT_CONCURRENCY", 16),
    DEFAULT_TENANT_DAILY=_int("DEFAULT_TENANT_DAILY", 10000),
    DEFAULT_TENANT_WEIGHT=_int("DEFAULT_TENANT_WEIGHT", 1),
    # --- Faz 5: webhook teslim (outbox-driven, HMAC imzali) ---
    WEBHOOK_MAX_ATTEMPTS=_int("WEBHOOK_MAX_ATTEMPTS", 6),
    WEBHOOK_BACKOFF_SECONDS=_int("WEBHOOK_BACKOFF_SECONDS", 30),
    WEBHOOK_TIMEOUT_SECONDS=_int("WEBHOOK_TIMEOUT_SECONDS", 10),
    # --- Faz 5: autoscale sinyali (kuyruk derinligi -> istenen worker sayisi) ---
    AUTOSCALE_BATCH=_int("AUTOSCALE_BATCH", 4),  # bir worker'in soguracagi backlog
    AUTOSCALE_MAX_WORKERS=_int("AUTOSCALE_MAX_WORKERS", 32),
    # --- Calistirma (docker): surec-ici worker + periyodik bakim dongusu ---
    RUN_INPROC_WORKER=os.environ.get("RUN_INPROC_WORKER", "0") == "1",
    WORKER_IDLE_SLEEP=float(os.environ.get("WORKER_IDLE_SLEEP", "0.2")),
    MAINTENANCE_INTERVAL_SECONDS=_int("MAINTENANCE_INTERVAL_SECONDS", 30),
)
