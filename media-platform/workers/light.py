"""Light worker: belge profilini uctan uca kosar (INGEST -> EXTRACT -> EVALUATE).

document_control pipeline_tasks.run_stage deseni; HTTP internal_client yerine
surec-ici engine cagrilari (Faz 2 tek-worker). OCR asamasi Faz 3 GPU-OCR'a ait
oldugundan burada OCR_UNAVAILABLE ile basarisiz olur ve engine bunu graceful
sekilde EVALUATE'e dusurur (dijital-PDF kaniti ile).
"""

import json

from config.settings import settings
from platform_core.errors import DomainError
from orchestrator import engine
from orchestrator.contracts import JobMessage
from orchestrator.dispatch import get_dispatcher
from orchestrator.pipeline import role_for


def _ocr_extract():
    """Yapilandirilmis OCR motorunu sec: gpu (PaddleOCR) veya tesseract (baseline)."""
    if settings.OCR_ENGINE == "gpu":
        from services.ocr.gpu_ocr import extract
    else:
        from services.ocr.tesseract import extract
    return extract


def process(message):
    msg = JobMessage.from_dict(message)
    op = msg.operation
    role = role_for(op)
    work = engine.claim(msg.job_id, op, role)
    if work.get("skip"):
        return
    lease = work["lease"]

    def read(kind):
        return engine.input_bytes(msg.job_id, lease, role, kind)

    try:
        output, binary = {}, None
        if op == "INGEST" and work["profile"] == "media":
            from services.media import ffmpeg

            ffmpeg.probe(read("QUARANTINE"))  # bounded dogrulama; byte passthrough
        elif op == "INGEST":
            from services.ingestion.formats import normalize

            binary = normalize(read("QUARANTINE"))
        elif op == "DEMUX":
            from platform_core import ephemeral
            from services.media import ffmpeg, vad

            wav = ffmpeg.to_wav16k_mono(read("ORIGINAL"))
            chunks = vad.chunk(wav, max_chunk_sec=work["max_chunk_sec"])
            for chunk in chunks:
                clip = vad.slice_wav(wav, chunk["start"], chunk["end"])
                # Chunk ses byte'lari kuyruga girmez; ephemeral'a parent job'una
                # keylenir (ASR cocuklari buradan okur).
                ephemeral.put(msg.asset_id, f"AUDIO_CHUNK_{chunk['index']}", clip, msg.job_id)
            output = {"chunks": chunks, "duration": vad.duration_seconds(wav)}
        elif op == "ASR":
            from services.asr import faster_whisper
            from services.asr.contracts import segments_to_dicts

            offset = work["chunk_offset"]
            segments = faster_whisper.transcribe(read("AUDIO_CHUNK"), offset=offset)
            output = {
                "schema_version": 1,
                "engine_version": faster_whisper.ENGINE,
                "duration": (segments[-1].end - offset) if segments else 0.0,
                "segments": segments_to_dicts(segments),
            }
        elif op == "MERGE":
            from services.media import merge as merge_mod

            manifest = json.loads(read("CHUNK_MANIFEST"))
            parts = [
                json.loads(read(f"TRANSCRIPT_CHUNK_{index}"))
                for index in range(work["chunk_total"])
            ]
            output = merge_mod.merge(parts, duration=manifest.get("duration"))
        elif op == "EXTRACT":
            from services.extraction.pdf import extract

            output = extract(read("ORIGINAL"))
        elif op == "OCR":
            # Faz 3: secili OCR motoru (gpu/tesseract). Motor/model yoksa
            # DomainError ile graceful degrade (engine OCR'i EVALUATE'e dusurur).
            output = _ocr_extract()(read("ORIGINAL"), work["ocr_pages"], work["document_type"])
        elif op == "EVALUATE":
            from services.evaluation.rules import parse, validate

            document_type = work["document_type"]
            original = parse(json.loads(read("PDF_TEXT")), document_type)
            previous, findings = None, original
            if work["ocr_done"]:
                try:
                    findings = parse(json.loads(read("OCR")), document_type)
                    previous = original
                except DomainError as error:
                    if error.code not in ("NOT_FOUND", "DOCUMENT_DATA_EXPIRED"):
                        raise
            output = validate(
                findings, document_type, previous, work["verified"], work["ocr_done"]
            )
        else:
            raise DomainError("WORKER_FAILED", 500)

        if binary is not None:
            engine.complete(msg.job_id, lease, role, binary=binary)
        else:
            engine.complete(msg.job_id, lease, role, output=output)
    except Exception as error:
        code = error.code if isinstance(error, DomainError) else "WORKER_FAILED"
        try:
            engine.failed(msg.job_id, lease, role, code)
        except DomainError:
            pass  # Suresi dolan lease reconcile tarafindan toparlanir.


def run_until_idle(max_messages=1000):
    """Kuyrugu bosaltana kadar tum hazir asamalari isler (tek-worker e2e)."""
    return get_dispatcher().consume_all(process, max_messages=max_messages)
