"""Chunk transcript'lerini zaman damgalariyla birlestir (ASR fan-in).

Her chunk, ses basina gore MUTLAK zaman damgali segmentler dondurur (ASR'ye
chunk offset'i verilir). Merge, segmentleri baslangica gore siralar, chunk
sinirlarindaki ortusmeleri/yineleri temizler ve transcript_schema'ya uygun tek
bir transcript uretir.
"""

from services.asr.contracts import transcript_schema

ENGINE = "faster-whisper-merge-v1"


def merge(parts, *, engine_version=ENGINE, duration=None):
    """parts: [{"segments": [...], "engine_version": str}] (chunk sirasinda).

    Segment dict'leri {text,start,end,confidence} (mutlak saniye).
    """
    segments = []
    for part in parts:
        for segment in part.get("segments", []):
            segments.append(dict(segment))
    segments.sort(key=lambda s: (s["start"], s["end"]))

    merged = []
    for segment in segments:
        text = segment["text"].strip()
        if not text:
            continue
        if merged:
            previous = merged[-1]
            # Chunk sinirinda ayni metin tekrar ederse birak.
            if text == previous["text"] and abs(segment["start"] - previous["start"]) < 0.5:
                continue
            # Ortusme: baslangici bir onceki bitise kadar ilerlet (azalmayan sira).
            if segment["start"] < previous["end"]:
                segment["start"] = previous["end"]
                if segment["end"] < segment["start"]:
                    segment["end"] = segment["start"]
        segment["text"] = text
        merged.append(segment)

    if duration is None:
        duration = max((s["end"] for s in merged), default=0.0)
    output = {
        "schema_version": 1,
        "engine_version": engine_version,
        "duration": float(duration),
        "segments": [
            {
                "text": s["text"],
                "start": float(s["start"]),
                "end": float(s["end"]),
                "confidence": float(s["confidence"]),
            }
            for s in merged
        ],
    }
    return transcript_schema(output)


def transcript_text(transcript):
    return " ".join(segment["text"] for segment in transcript["segments"]).strip()
