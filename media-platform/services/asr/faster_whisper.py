"""Local faster-whisper (CTranslate2) ASR motoru. Tamamen local; dis API yok.

Local-only kisit: model agirliklari vendor'lanir (ASR_MODEL_DIR); runtime'da
indirme YOK. Model dizini yoksa ASR_MODELS_MISSING. faster_whisper import
edilemezse ASR_UNAVAILABLE. Bir chunk'in wav'i + mutlak offset verilir; motor
offset-uygulanmis TranscriptSegment listesi dondurur (merge fan-in icin).
"""

import logging
import math
from pathlib import Path

import numpy as np

from config.settings import settings

from platform_core.errors import DomainError
from services.asr.contracts import TranscriptSegment
from services.media.vad import read_wav

log = logging.getLogger(__name__)
ENGINE = "faster-whisper-ct2-v1"

_model = None


def _load_model():
    """Vendor'lanmis model dizininden tek sicak model (cache)."""
    global _model
    if _model is not None:
        return _model
    if not settings.ASR_MODEL_DIR or not Path(settings.ASR_MODEL_DIR).is_dir():
        raise DomainError("ASR_MODELS_MISSING", 503)
    try:
        from faster_whisper import WhisperModel
    except Exception:
        raise DomainError("ASR_UNAVAILABLE", 503) from None
    _model = WhisperModel(
        settings.ASR_MODEL_DIR,
        device=settings.ASR_DEVICE,
        compute_type=settings.ASR_COMPUTE_TYPE,
    )
    return _model


def set_model(model):
    """Test/enjeksiyon: sicak modeli dogrudan ayarla."""
    global _model
    _model = model


def _confidence(segment):
    logprob = getattr(segment, "avg_logprob", None)
    if logprob is None:
        return 1.0
    return max(0.0, min(1.0, math.exp(logprob)))


def transcribe(wav_bytes, *, offset=0.0, language=None):
    """Bir chunk'i tani; segment zaman damgalarina `offset` eklenir (mutlak ts)."""
    model = _load_model()
    _, samples = read_wav(wav_bytes)
    audio = samples.astype(np.float32) / 32768.0
    try:
        segments, _info = model.transcribe(
            audio,
            beam_size=settings.ASR_BEAM_SIZE,
            language=language or settings.ASR_LANGUAGE,
        )
    except DomainError:
        raise
    except Exception:
        raise DomainError("ASR_FAILED", 422) from None
    result = []
    for segment in segments:
        text = (getattr(segment, "text", "") or "").strip()
        if not text:
            continue
        start = offset + float(getattr(segment, "start", 0.0))
        end = offset + float(getattr(segment, "end", start))
        result.append(
            TranscriptSegment(
                text=text, start=start, end=max(start, end), confidence=_confidence(segment)
            )
        )
    return result
