"""Faz 1 test harness.

document_control'un Django fixture'lari (vault/personnel/api_client) TASINMADI.
Burada yalnizca iki atlama kurali var:
- `@pytest.mark.django_db` isaretli entegrasyon testleri sonraki faza ertelenir.
- `test_criminal_ocr` sistemde `tesseract` yoksa atlanir (OCR baseline).
"""

import shutil

import pytest

# Control plane (Django `apps`) gerektiren entegrasyon testleri Faz 2'ye ertelendi.
# Bunlar `django_db` ile isaretli olmayabilir ama `apps.*` import ettikleri icin
# Faz 1 engine reposunda calismazlar.
DEFERRED_INTEGRATION = {
    "test_ingestion_scans_before_image_decode",
}


def pytest_collection_modifyitems(config, items):
    tesseract_available = shutil.which("tesseract") is not None
    skip_db = pytest.mark.skip(reason="Django-DB entegrasyon testi sonraki faza ertelendi")
    skip_ocr = pytest.mark.skip(reason="tesseract bulunamadi (OCR baseline testi)")
    skip_integration = pytest.mark.skip(reason="Control-plane (apps) entegrasyon testi Faz 2")
    for item in items:
        if "django_db" in item.keywords:
            item.add_marker(skip_db)
        if item.name in DEFERRED_INTEGRATION:
            item.add_marker(skip_integration)
        module = getattr(item, "module", None)
        if not tesseract_available and module is not None and module.__name__.endswith(
            "test_criminal_ocr"
        ):
            item.add_marker(skip_ocr)
