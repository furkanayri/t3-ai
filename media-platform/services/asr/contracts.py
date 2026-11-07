"""ASR cikti kontrati (medya profili). Belge engine'lerinin ExtractionOutput'una
paralel: ASR, zaman damgali TranscriptSegment uretir. Orchestrator yalniz bu
semaya baglanir; motor (faster-whisper) degistirilebilir kalir.
"""

import math
from dataclasses import dataclass

from platform_core.errors import DomainError

MAX_SEGMENTS = 100_000


@dataclass(frozen=True)
class TranscriptSegment:
    text: str
    start: float  # saniye (medya basindan)
    end: float
    confidence: float  # [0, 1]


def _finite(value):
    return isinstance(value, (int, float)) and math.isfinite(value)


def transcript_schema(output):
    """Bozuk/asiri transcript'i kalici artefakt olmadan reddet."""
    try:
        if set(output) != {"schema_version", "engine_version", "duration", "segments"}:
            raise ValueError()
        if output["schema_version"] != 1:
            raise ValueError()
        if not (isinstance(output["engine_version"], str) and len(output["engine_version"]) <= 80):
            raise ValueError()
        if not (_finite(output["duration"]) and output["duration"] >= 0):
            raise ValueError()
        segments = output["segments"]
        if not isinstance(segments, list) or len(segments) > MAX_SEGMENTS:
            raise ValueError()
        previous_start = -1.0
        for segment in segments:
            if set(segment) != {"text", "start", "end", "confidence"}:
                raise ValueError()
            if not (isinstance(segment["text"], str) and len(segment["text"]) <= 100_000):
                raise ValueError()
            if not (_finite(segment["start"]) and _finite(segment["end"])):
                raise ValueError()
            if not (0 <= segment["start"] <= segment["end"]):
                raise ValueError()
            if not (_finite(segment["confidence"]) and 0 <= segment["confidence"] <= 1):
                raise ValueError()
            # Segmentler baslangica gore azalmayan sirada olmali (merge garantisi).
            if segment["start"] < previous_start:
                raise ValueError()
            previous_start = segment["start"]
    except (AttributeError, KeyError, TypeError, ValueError):
        raise DomainError("INVALID_OUTPUT", 422) from None
    return output


def segments_to_dicts(segments):
    return [
        {
            "text": s.text,
            "start": float(s.start),
            "end": float(s.end),
            "confidence": float(s.confidence),
        }
        for s in segments
    ]
