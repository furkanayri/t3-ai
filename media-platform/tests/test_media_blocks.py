"""Medya yapitaslari birim testleri: probe, VAD chunker, slice, merge, ASR (fake)."""

from services.asr import faster_whisper
from services.asr.contracts import transcript_schema
from services.media import ffmpeg, merge, vad
from tests.synthetic_media import speech_wav


def test_probe_wav_reports_duration():
    info = ffmpeg.probe(speech_wav())
    assert info["kind"] == "WAV"
    assert info["sample_rate"] == vad.TARGET_RATE
    assert 5.5 < info["duration"] < 6.5


def test_wav_passthrough_needs_no_ffmpeg():
    data = speech_wav()
    # Hedef 16k mono WAV ffmpeg olmadan aynen gecer.
    assert ffmpeg.to_wav16k_mono(data) == data


def test_chunker_splits_on_silence():
    chunks = vad.chunk(speech_wav())
    assert len(chunks) >= 2
    # Azalmayan, bitisik ve indeksli.
    for index, chunk in enumerate(chunks):
        assert chunk["index"] == index
        assert chunk["start"] < chunk["end"]
        if index:
            assert chunk["start"] >= chunks[index - 1]["start"]


def test_slice_wav_returns_shorter_clip():
    data = speech_wav()
    clip = vad.slice_wav(data, 0.0, 1.0)
    assert vad.duration_seconds(clip) <= 1.01
    assert ffmpeg.probe(clip)["kind"] == "WAV"


def test_merge_orders_dedups_and_validates():
    parts = [
        {"segments": [{"text": "ikinci", "start": 2.0, "end": 3.0, "confidence": 0.9}]},
        {"segments": [{"text": "birinci", "start": 0.0, "end": 1.0, "confidence": 0.9}]},
        # Chunk sinirinda yinelenen segment:
        {"segments": [{"text": "ikinci", "start": 2.0, "end": 3.0, "confidence": 0.9}]},
    ]
    transcript = merge.merge(parts, duration=3.0)
    transcript_schema(transcript)  # sema gecerli
    texts = [s["text"] for s in transcript["segments"]]
    assert texts == ["birinci", "ikinci"]  # sirali + dedup


class _Seg:
    def __init__(self, start, end, text, avg_logprob=-0.1):
        self.start, self.end, self.text, self.avg_logprob = start, end, text, avg_logprob


class _FakeModel:
    def transcribe(self, audio, **kwargs):
        duration = len(audio) / vad.TARGET_RATE
        return ([_Seg(0.0, duration, "merhaba dunya")], {})


def test_asr_applies_offset_with_fake_model():
    faster_whisper.set_model(_FakeModel())
    try:
        segments = faster_whisper.transcribe(vad.slice_wav(speech_wav(), 0.0, 1.0), offset=2.3)
    finally:
        faster_whisper.set_model(None)
    assert len(segments) == 1
    assert segments[0].text == "merhaba dunya"
    assert abs(segments[0].start - 2.3) < 1e-6
    assert 0 <= segments[0].confidence <= 1
