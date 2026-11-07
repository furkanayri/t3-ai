"""GPU-OCR motoru testleri.

- Sema-uyum testi PaddleOCR GEREKTIRMEZ: sahte bir reader enjekte edip gpu_ocr'in
  ExtractionOutput semasina (schema_version=2, OCR) birebir uydugunu dogrular.
- Gercek motor testi yalnizca paddleocr + vendor'lanmis modeller varsa kosar.
"""

import pytest

from config.settings import settings
from services.evaluation.rules import parse, validate
from services.extraction.contracts import output_schema
from services.ocr import gpu_ocr
from tests.synthetic import pdf as synthetic_pdf

# (pts, text, score) — rendered taranmis sayfa piksel koordinatlarinda.
_FAKE_LINES = [
    ([[90, 60], [900, 60], [900, 110], [90, 110]], "YUKSEKOGRETIM KURULU", 0.99),
    ([[90, 130], [700, 130], [700, 180], [90, 180]], "OGRENCI BELGESI", 0.98),
    ([[90, 220], [1000, 220], [1000, 270], [90, 270]], "T.C. Kimlik No : 10000000146", 0.97),
    ([[90, 300], [1000, 300], [1000, 350], [90, 350]], "Adi Soyadi : Sentetik Kisi", 0.96),
    ([[90, 380], [1000, 380], [1000, 430], [90, 430]], "Ogrencilik Durumu : AKTIF", 0.95),
]


class _FakeReader:
    def ocr(self, image, cls=True):
        return [[[pts, (text, score)] for pts, text, score in _FAKE_LINES]]


def test_gpu_ocr_output_schema(monkeypatch):
    monkeypatch.setattr(gpu_ocr, "_reader", lambda lang: _FakeReader())
    out = gpu_ocr.extract(synthetic_pdf(scanned=True), [1], "STUDENT")

    # Sema document_control output_schema ile birebir dogrulanir (fark = DomainError).
    assert output_schema(out, "OCR") is out
    assert out["method"] == "OCR"
    assert out["schema_version"] == 2
    assert out["processed_pages"] == [1]
    assert out["blocks"], "en az bir blok beklenir"
    for block in out["blocks"]:
        assert block["variant"]
        assert all(0 <= w["confidence"] <= 1 for w in block["words"])

    # Evaluation katmani engine-agnostik: ayni parse/validate zinciri calisir.
    result = validate(parse(out, "STUDENT"), "STUDENT", None, True, True)
    assert result["document_family"] == "YOK"
    assert result["student_status"] == "ACTIVE"


def test_gpu_ocr_requires_vendored_models():
    """Local-only: model dizinleri yoksa indirmeye izin yok -> OCR_MODELS_MISSING."""
    from platform_core.errors import DomainError

    gpu_ocr._readers.clear()
    if settings.PADDLE_DET_DIR and settings.PADDLE_REC_DIR and settings.PADDLE_CLS_DIR:
        pytest.skip("model dizinleri yapilandirilmis")
    with pytest.raises(DomainError) as info:
        gpu_ocr._reader(settings.PADDLE_LANG)
    assert info.value.code in ("OCR_MODELS_MISSING", "OCR_UNAVAILABLE")


@pytest.mark.gpu_ocr
def test_gpu_ocr_real_engine():
    pytest.importorskip("paddleocr")
    if not (settings.PADDLE_DET_DIR and settings.PADDLE_REC_DIR and settings.PADDLE_CLS_DIR):
        pytest.skip("vendor'lanmis PaddleOCR modelleri yapilandirilmamis")
    out = gpu_ocr.extract(synthetic_pdf(scanned=True), [1], "STUDENT")
    assert output_schema(out, "OCR") is out
