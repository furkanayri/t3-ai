"""Local GPU-OCR motoru (PaddleOCR) — OCREngine SPI'si, ExtractionOutput semasi.

KARAR (plan): OCR yolu GPU-OCR'a gecer; bu yolda parity HEDEFI DEGILDIR, yerine
ground-truth korpusuna karsi accuracy olculur (scripts/ocr_accuracy.py). Motor,
tesseract.py ile AYNI cikti semasini uretir (schema_version=2; bloklar
text/bbox/confidence/words/variant), boylece evaluation katmani engine-agnostik
kalir ve parse/validate degismeden calisir.

Local-only kisit: model agirliklari vendor'lanir (PADDLE_*_DIR); runtime'da
indirme YOK. Model dizinleri verilmezse OCR_MODELS_MISSING yukselir.

tesseract.py'nin OCR-agnostik yardimcilari (geometri, barkod=zxing, evaluation
geri-beslemeli bolge secimi) yeniden kullanilir; yalniz TANIMA adimi PaddleOCR'dir.
Tesseract gecis boyunca baseline/A-B referansi olarak korunur.
"""

import logging
import os
import time
from pathlib import Path

import cv2
import numpy as np
import pymupdf

from config.settings import settings

from platform_core.errors import DomainError
from services.evaluation.rules import parse
from services.extraction.pdf import open_pdf
from services.ocr.tesseract import (
    _artifact,
    _barcode_blocks,
    _bbox,
    _retry_regions,
    _trim_separator,
    _value_regions,
)

log = logging.getLogger(__name__)
ENGINE = f"paddleocr-{settings.PADDLE_LANG}-pipeline-v1"

_readers = {}


def _reader(lang):
    """Vendor'lanmis model dizinleriyle PaddleOCR; runtime indirme engellenir."""
    if lang in _readers:
        return _readers[lang]
    if not (settings.PADDLE_DET_DIR and settings.PADDLE_REC_DIR and settings.PADDLE_CLS_DIR):
        # Local-only: indirmeye izin yok. Model dizinleri zorunlu.
        raise DomainError("OCR_MODELS_MISSING", 503)
    try:
        from paddleocr import PaddleOCR
    except Exception:
        raise DomainError("OCR_UNAVAILABLE", 503) from None
    for directory in (settings.PADDLE_DET_DIR, settings.PADDLE_REC_DIR, settings.PADDLE_CLS_DIR):
        if not Path(directory).is_dir():
            raise DomainError("OCR_MODELS_MISSING", 503)
    reader = PaddleOCR(
        det_model_dir=settings.PADDLE_DET_DIR,
        rec_model_dir=settings.PADDLE_REC_DIR,
        cls_model_dir=settings.PADDLE_CLS_DIR,
        use_angle_cls=True,
        use_gpu=settings.PADDLE_USE_GPU,
        lang=lang,
        show_log=False,
    )
    _readers[lang] = reader
    return reader


def _lang_for(document_type):
    return settings.PADDLE_LANG


def _normalize_lines(raw):
    """PaddleOCR surum farklarini tek bicime indir: [(pts, text, score), ...]."""
    if not raw:
        return []
    page = raw[0] if (len(raw) == 1 and isinstance(raw[0], list)) else raw
    lines = []
    for entry in page or []:
        try:
            pts, rec = entry[0], entry[1]
            text, score = rec[0], float(rec[1])
        except (TypeError, IndexError, ValueError):
            continue
        if not str(text).strip():
            continue
        lines.append((pts, str(text), max(0.0, min(1.0, score))))
    return lines


def _words(text, box, score):
    """Satiri kelimelere bol; her kelimeye satir kutusundan orantili bir kutu ve
    satir guvenini ata (PaddleOCR satir-bazli skor verir; evaluation kelime-bazli
    guven bekler)."""
    tokens = text.split()
    if not tokens:
        return []
    x0, y0, x1, y1 = box
    total = sum(len(token) for token in tokens) + max(1, len(tokens) - 1)
    width = x1 - x0
    words, cursor = [], 0
    for token in tokens:
        start = x0 + width * cursor / total
        cursor += len(token)
        end = x0 + width * cursor / total
        cursor += 1  # bosluk
        words.append(
            {
                "text": token,
                "bbox": [float(start), float(y0), float(end), float(y1)],
                "confidence": score,
            }
        )
    return words


def _recognize(image, transform, number, variant, *, reader):
    """Bir goruntuyu PaddleOCR ile tani; tesseract._read ile ayni blok semasi."""
    try:
        raw = reader.ocr(image, cls=True)
    except DomainError:
        raise
    except Exception:
        raise DomainError("OCR_UNAVAILABLE", 503) from None
    blocks = []
    for index, (pts, text, score) in enumerate(_normalize_lines(raw)):
        xs = [float(p[0]) for p in pts]
        ys = [float(p[1]) for p in pts]
        box = _bbox([min(xs), min(ys), max(xs), max(ys)], transform)
        blocks.append(
            {
                "block_id": f"gpu-p{number}-{variant}-l{index}",
                "page": number,
                "bbox": box,
                "text": text,
                "confidence": score,
                "words": _words(text, box, score),
                "variant": variant,
            }
        )
    return blocks


def _value_retries(image, to_pdf, blocks, metadata, scale, *, reader, deadline):
    """Evaluation geri-beslemeli: eksik/dusuk-guvenli deger satirlarini kirpip
    yeniden tani (tesseract'in value-region deseninin GPU karsiligi)."""
    retries = []
    for index, (box, label, source) in enumerate(list(_value_regions(blocks, metadata))[:20]):
        if deadline - time.monotonic() < 1:
            break
        x0, y0, x1, y1 = box
        x0, y0 = max(0, int(x0 * scale) - 2), max(0, int(y0 * scale) - 4)
        x1 = min(image.shape[1], int(x1 * scale) + 4)
        y1 = min(image.shape[0], int(y1 * scale) + 5)
        crop = image[y0:y1, x0:x1]
        if not crop.size:
            continue
        if not str(source.get("_value_text", "")).startswith(("(", "-", "/")):
            crop, offset = _trim_separator(crop)
            x0 += offset
        crop = cv2.copyMakeBorder(crop, 12, 12, 12, 12, cv2.BORDER_CONSTANT, value=(255, 255, 255))
        matrix = to_pdf @ np.array([[1, 0, x0 - 12], [0, 1, y0 - 12], [0, 0, 1]], float)
        for block in _recognize(crop, matrix, metadata["page"], f"value{index}", reader=reader):
            block["text"] = label + " : " + block["text"]
            block["bbox"] = source["bbox"]
            retries.append(block)
    return retries


def _region_retries(image, to_pdf, blocks, metadata, scale, document_type, *, reader, deadline):
    retries = []
    for index, box in enumerate(list(_retry_regions(blocks, metadata, document_type))[:18]):
        if deadline - time.monotonic() < 1:
            break
        x0, y0, x1, y1 = box
        margin = max(3, (y1 - y0) * 0.35)
        x0, y0 = max(0, int((x0 - margin) * scale)), max(0, int((y0 - margin) * scale))
        x1 = min(image.shape[1], int((x1 + margin) * scale))
        y1 = min(image.shape[0], int((y1 + margin) * scale))
        crop = image[y0:y1, x0:x1]
        if not crop.size:
            continue
        matrix = to_pdf @ np.array([[1, 0, x0], [0, 1, y0], [0, 0, 1]], float)
        retries.extend(_recognize(crop, matrix, metadata["page"], f"roi{index}", reader=reader))
    return retries


def extract(data, pages, document_type="STUDENT"):
    """OCREngine giris noktasi — tesseract.extract ile ayni imza ve cikti semasi."""
    reader = _reader(_lang_for(document_type))
    blocks, dimensions = [], []
    with open_pdf(data) as doc:
        for number in sorted(set(pages)):
            if not 1 <= number <= len(doc):
                raise DomainError("OCR_PAGE_INVALID", 422)
            started = time.monotonic()
            deadline = started + 45
            page = doc[number - 1]
            rotation = page.rotation
            page.set_rotation(0)
            metadata = {
                "page": number,
                "width": page.mediabox.width,
                "height": page.mediabox.height,
                "rotation": rotation,
            }
            scale = min(300 / 72, (25_000_000 / (page.rect.width * page.rect.height)) ** 0.5)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
            image = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            to_pdf = np.diag([1 / scale, 1 / scale, 1.0])

            best = _recognize(image, to_pdf, number, "base", reader=reader)
            barcode = _barcode_blocks(image, to_pdf, number)
            findings = parse(_artifact(best + barcode, metadata), document_type)
            missing = any(
                not any(c["reliable"] for c in findings["fields"][field])
                for field in findings["expected_fields"]
            )
            if missing or not findings["recognized"]:
                best.extend(
                    _value_retries(
                        image, to_pdf, best, metadata, scale, reader=reader, deadline=deadline
                    )
                )
                best.extend(
                    _region_retries(
                        image,
                        to_pdf,
                        best,
                        metadata,
                        scale,
                        document_type,
                        reader=reader,
                        deadline=deadline,
                    )
                )
            blocks.extend(best + barcode)
            dimensions.append(metadata)
            if not best and time.monotonic() >= deadline:
                raise DomainError("OCR_TIMEOUT", 422)
            log.info(
                "gpu_ocr_page_completed",
                extra={
                    "event": "gpu_ocr_page_completed",
                    "duration_ms": round((time.monotonic() - started) * 1000),
                    "blocks": len(best),
                },
            )
    return {
        "schema_version": 2,
        "method": "OCR",
        "engine_version": ENGINE,
        "pages": dimensions,
        "processed_pages": sorted(set(pages)),
        "blocks": blocks,
    }
