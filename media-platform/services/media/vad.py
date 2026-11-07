"""Deterministik VAD-benzeri chunk'lama (16 kHz mono PCM WAV uzerinde).

ASR fan-out'un girdisi: uzun ses, sessizlik sinirlarindan ve bir ust uzunluk
tavanindan N parcaya bolunur. Enerji-esikli, kutuphanesiz ve deterministik;
ayni girdi her zaman ayni chunk manifestini verir (dedup/cache ile uyumlu).
"""

import io
import wave

import numpy as np

from platform_core.errors import DomainError

TARGET_RATE = 16_000


def read_wav(data):
    try:
        with wave.open(io.BytesIO(data), "rb") as handle:
            channels = handle.getnchannels()
            width = handle.getsampwidth()
            rate = handle.getframerate()
            frames = handle.readframes(handle.getnframes())
    except (wave.Error, EOFError, OSError):
        raise DomainError("MEDIA_INVALID", 422) from None
    if width != 2 or channels != 1:
        raise DomainError("MEDIA_UNSUPPORTED", 422)
    samples = np.frombuffer(frames, dtype=np.int16)
    return rate, samples


def write_wav(rate, samples):
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(rate)
        handle.writeframes(samples.astype(np.int16).tobytes())
    return buffer.getvalue()


def duration_seconds(data):
    rate, samples = read_wav(data)
    return len(samples) / float(rate)


def _frame_rms(samples, frame_len):
    usable = (len(samples) // frame_len) * frame_len
    if usable == 0:
        return np.array([_rms(samples)])
    frames = samples[:usable].astype(np.float64).reshape(-1, frame_len)
    rms = np.sqrt(np.mean(frames**2, axis=1))
    tail = samples[usable:]
    if len(tail):
        rms = np.append(rms, _rms(tail))
    return rms


def _rms(samples):
    if not len(samples):
        return 0.0
    return float(np.sqrt(np.mean(samples.astype(np.float64) ** 2)))


def chunk(data, *, frame_ms=30, max_chunk_sec=20.0, min_silence_sec=0.4, min_chunk_sec=1.0):
    """Chunk manifesti: [{index, start, end}] saniye cinsinden, azalmayan sirali."""
    rate, samples = read_wav(data)
    total = len(samples) / float(rate)
    if total <= 0:
        raise DomainError("MEDIA_INVALID", 422)
    frame_len = max(1, int(rate * frame_ms / 1000))
    rms = _frame_rms(samples, frame_len)
    threshold = max(float(rms.max()) * 0.12, 60.0)
    voiced = rms > threshold

    # Sessizlik bosluklarini (ardisik sessiz frame) kesim noktalarina cevir.
    min_silence_frames = max(1, int(min_silence_sec * 1000 / frame_ms))
    boundaries = [0.0]
    run_start = None
    for index, is_voiced in enumerate(voiced):
        if not is_voiced:
            run_start = index if run_start is None else run_start
        else:
            if run_start is not None and index - run_start >= min_silence_frames:
                cut = (run_start + index) / 2 * frame_ms / 1000.0
                if cut - boundaries[-1] >= min_chunk_sec:
                    boundaries.append(cut)
            run_start = None
    boundaries.append(total)

    # Ust uzunluk tavanini zorla (sessizlik yoksa da bol).
    bounded = [boundaries[0]]
    for edge in boundaries[1:]:
        while edge - bounded[-1] > max_chunk_sec:
            bounded.append(bounded[-1] + max_chunk_sec)
        bounded.append(edge)
    edges = sorted(set(round(b, 3) for b in bounded))

    chunks = []
    for index in range(len(edges) - 1):
        start, end = edges[index], edges[index + 1]
        if end - start < 1e-3:
            continue
        chunks.append({"index": len(chunks), "start": start, "end": end})
    if not chunks:
        chunks = [{"index": 0, "start": 0.0, "end": total}]
    return chunks


def slice_wav(data, start, end):
    rate, samples = read_wav(data)
    a = max(0, int(start * rate))
    b = min(len(samples), int(end * rate))
    return write_wav(rate, samples[a:b])
