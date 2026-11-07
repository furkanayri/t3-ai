"""ffmpeg demux/probe (medya -> 16 kHz mono WAV). Tamamen local; dis API yok.

WAV girdisi ffmpeg GEREKTIRMEZ (dogrudan islenir) — bu, dev/test ve saf-ses
yolunu ffmpeg olmadan kosturur. Diger formatlar icin ffmpeg subprocess; binary
yoksa MEDIA_TOOL_UNAVAILABLE ile graceful.
"""

import io
import subprocess
import wave

from config.settings import settings

from platform_core.errors import DomainError
from services.media.vad import TARGET_RATE

MAX_MEDIA_BYTES = 2 * 1024 * 1024 * 1024  # 2 GiB (buyuk video prod'da S3 stream)


def identify_media(data):
    if len(data) < 12:
        raise DomainError("FORMAT_UNSUPPORTED", 422)
    if data[:4] == b"RIFF" and data[8:12] == b"WAVE":
        return "WAV"
    if data[:4] == b"\x1aE\xdf\xa3":  # EBML -> Matroska/WebM
        return "VIDEO"
    if data[4:8] == b"ftyp":  # ISO BMFF -> mp4/m4a
        return "VIDEO"
    if data[:3] == b"ID3" or data[:2] in (b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"):
        return "AUDIO"
    if data[:4] == b"OggS":
        return "AUDIO"
    raise DomainError("FORMAT_UNSUPPORTED", 422)


def _is_target_wav(data):
    try:
        with wave.open(io.BytesIO(data), "rb") as handle:
            return (
                handle.getnchannels() == 1
                and handle.getsampwidth() == 2
                and handle.getframerate() == TARGET_RATE
            )
    except Exception:
        return False


def probe(data):
    """Hafif metadata. WAV icin header'dan; aksi halde ffprobe."""
    kind = identify_media(data)
    if kind == "WAV":
        with wave.open(io.BytesIO(data), "rb") as handle:
            return {
                "kind": "WAV",
                "duration": handle.getnframes() / float(handle.getframerate() or TARGET_RATE),
                "channels": handle.getnchannels(),
                "sample_rate": handle.getframerate(),
            }
    return {"kind": kind, "duration": None, "channels": None, "sample_rate": None}


def to_wav16k_mono(data):
    """16 kHz mono WAV dondurur. Hedef WAV ise oldugu gibi; aksi halde ffmpeg."""
    if len(data) > MAX_MEDIA_BYTES:
        raise DomainError("FILE_TOO_LARGE", 413)
    identify_media(data)
    if _is_target_wav(data):
        return data
    command = [
        settings.FFMPEG_BINARY,
        "-nostdin",
        "-i",
        "pipe:0",
        "-vn",
        "-ac",
        "1",
        "-ar",
        str(TARGET_RATE),
        "-f",
        "wav",
        "pipe:1",
    ]
    try:
        result = subprocess.run(
            command,
            input=data,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=600,
            check=True,
        )
    except FileNotFoundError:
        raise DomainError("MEDIA_TOOL_UNAVAILABLE", 503) from None
    except subprocess.TimeoutExpired:
        raise DomainError("MEDIA_TIMEOUT", 422) from None
    except subprocess.CalledProcessError:
        raise DomainError("MEDIA_INVALID", 422) from None
    if not result.stdout:
        raise DomainError("MEDIA_INVALID", 422)
    return result.stdout
