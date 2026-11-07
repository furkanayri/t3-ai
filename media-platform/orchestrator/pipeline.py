"""Deklaratif profil -> asama DAG'i + kaynak-sinifi rol eslemesi.

Mantiksal asama zinciri burada sabit kalir (state/retry/idempotency kaynagi);
worker havuzlari kaynak sinifina gore toplanir. Faz 2 yalnizca `document`
profilini uctan uca kosar; `media` profili Faz 4'e yer tutar.
"""

from config.settings import settings

# Her asama hangi worker rolu tarafindan islenir (kaynak sinifi).
ROLES = {
    "FETCH": "fetch",
    "INGEST": "orchestration",
    "EXTRACT": "extraction",
    "OCR": "ocr",
    "EVALUATE": "evaluation",
    "DEMUX": "media",
    "ASR": "asr",
    "MERGE": "orchestration",
}

# `input` ile cekilebilecek ephemeral byte turleri (asamaya gore).
# Medya asamalari (DEMUX/ASR/MERGE) dinamik chunk anahtarlari kullandigi icin
# input_bytes() icinde ayrica ele alinir; burada sadece sabit turler listelenir.
STAGE_INPUT_KINDS = {
    "INGEST": {"QUARANTINE"},
    "EXTRACT": {"ORIGINAL"},
    "OCR": {"ORIGINAL"},
    "EVALUATE": {"PDF_TEXT", "OCR"},
    "DEMUX": {"ORIGINAL"},
}

TERMINAL = {"COMPLETED", "FAILED", "CANCELLED"}


def lease_seconds(stage):
    return settings.OCR_LEASE_SECONDS if stage == "OCR" else settings.LEASE_SECONDS


def role_for(stage):
    return ROLES.get(stage)


def initial_stage(has_url):
    """Belge profilinin giris asamasi: URL kaynagi FETCH, yukleme INGEST."""
    return "FETCH" if has_url else "INGEST"


# Belge profili statik gecisleri (dinamik dallanma complete() icinde: EVALUATE
# ciktisi needs_ocr verirse OCR'a, degilse DONE).
DOCUMENT_NEXT = {
    "FETCH": "INGEST",
    "INGEST": "EXTRACT",
    "EXTRACT": "EVALUATE",
    "OCR": "EVALUATE",
}

# Medya profili: INGEST(probe) -> DEMUX(16k wav + VAD chunk) -> ASR(fan-out)
# -> MERGE(fan-in). ASR asamasi complete() icinde N cocuk job'a dallanir;
# barrier sifirlaninca parent MERGE'e enqueue edilir.
MEDIA_NEXT = {
    "INGEST": "DEMUX",
    "DEMUX": "ASR",
}
