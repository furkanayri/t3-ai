import copy
import io

import numpy as np
import pymupdf
import pytest
from PIL import Image

from platform_core.errors import DomainError
from services.evaluation.contracts import result_schema
from services.evaluation.rules import parse, validate
from services.extraction.contracts import output_schema
from services.ingestion.formats import identify, normalize
from services.ocr.tesseract import _bbox, _photo
from tests.synthetic import IDENTITY
from tests.test_yok_student_v3 import artifact, complete_lines


def ek17():
    return [
        "EK-17",
        "İLKOKUL/ORTAOKUL ÖĞRENCİ BELGESİ",
        "OKULUN",
        "İli : Örnek İl",
        "İlçesi : Örnek İlçe",
        "Adı : Örnek Ortaokulu",
        "ÖĞRENCİNİN",
        f"T.C. Kimlik NO : {IDENTITY}",
        "Adı Soyadı : Örnek Öğrenci",
        "Baba Adı : Örnek Baba",
        "Ana Adı : Örnek Anne",
        "Doğum Yeri : Örnek Yer",
        "Doğum Tarihi : 03/04/2012",
        "Yukarıda açık kimliği yazılı Örnek Öğrenci okulumuzun 8. Sınıf / A",
        "Şubesi'nde 114 numara ile kayıtlı olup halen devamlı öğrencimizdir.",
        "Bu belge öğrenci velisinin isteği üzerine 05/10/2026 tarihinde verilmiştir.",
        "Okul Müdürü",
        "İmza ve Resmî Mühür",
    ]


def evaluated(lines, **kwargs):
    return result_schema(
        validate(
            parse(artifact(lines, **kwargs), "STUDENT"), "STUDENT", verified=True, ocr_done=True
        )
    )


def test_ocr_encoding_time_is_part_of_deadline(monkeypatch):
    from services.ocr import tesseract

    ticks = iter([1.0, 2.8])
    monkeypatch.setattr(tesseract.time, "monotonic", lambda: next(ticks))

    def unexpected(*args, **kwargs):
        pytest.fail("OCR subprocess must not start after the encoding exhausts its budget")

    monkeypatch.setattr(tesseract.subprocess, "run", unexpected)
    assert tesseract._read(np.full((20, 30, 3), 255, np.uint8), np.eye(3), 1, "test", 3) == []


def test_duplicate_targeted_regions_are_read_only_once():
    from services.ocr.tesseract import _retry_regions

    source = artifact(ek17(), method="OCR", confidence=0.8)
    duplicate = copy.deepcopy(source["blocks"])
    for block in duplicate:
        block["variant"] = "value0"
        block["block_id"] += "-retry"
    regions = list(_retry_regions(source["blocks"] + duplicate, source["pages"][0], "STUDENT"))
    assert regions
    assert len(regions) == len({tuple(box) for box in regions})


@pytest.mark.parametrize("method,confidence", [("PDF_TEXT", None), ("OCR", 0.96)])
def test_ek17_all_structured_fields_and_absent_barcode(method, confidence):
    result = evaluated(ek17(), method=method, confidence=confidence)
    assert result["document_family"] == "MEB"
    assert result["document_metadata"]["layout"] == "MEB_EK17"
    assert result["document_metadata"]["issue_date"] == "2026-10-05"
    assert result["identity"]["mother_name"] == "Örnek Anne"
    assert result["identity"]["birth_date"] == "2012-04-03"
    assert result["student"]["school_location"] == "Örnek İl / Örnek İlçe"
    assert result["student"]["class_level"] == "8. Sınıf / A"
    assert result["student"]["student_number"] == "114"
    assert result["student_status"] == "ACTIVE"
    assert result["field_states"]["barcode"] == "NOT_PRESENT"
    assert not result["warnings"]


def test_school_letter_aliases_and_split_field_branch():
    lines = [
        "T.C.",
        "ÖRNEK VALİLİĞİ",
        "Örnek İlçe / Örnek Lisesi Müdürlüğü",
        "ÖĞRENCİ BELGESİ",
        "Öğrencinin Adı Soyadı : Örnek Öğrenci",
        f"T.C. Kimlik Numarası : {IDENTITY}",
        "Baba Adı : Örnek Baba",
        "Anne Adı : Örnek Anne",
        "Doğum Yeri : Örnek Yer",
        "Doğum Tarihi : 03/04/2012",
        "Okulu : Örnek Lisesi",
        "Alanı/Dalı : FEN BİLİMLERİ / DAL YOK",
        "Sınıfı : 10. Sınıf / A Şubesi",
        "Numarası : 320",
        "Öğrenci Belgesinin Alındığı Tarih : 13/10/2026",
        "Yukarıda açık kimliği yazılı Örnek Öğrenci okulumuzun devamlı",
        "öğrencisidir.",
    ]
    result = evaluated(lines)
    assert result["document_metadata"]["layout"] == "MEB_SCHOOL_LETTER"
    assert result["student"]["school_location"] == "ÖRNEK / Örnek İlçe"
    assert result["student"]["education_field"] == "FEN BİLİMLERİ"
    assert result["student"]["education_branch"] == "DAL YOK"
    assert result["student"]["student_number"] == "320"
    assert result["student_status"] == "ACTIVE"
    assert not result["warnings"]


@pytest.mark.parametrize(
    "text,status",
    [
        ("PASİF ÖĞRENCİLER (KAYIT YENİLEMEMİŞ)", "PASSIVE"),
        ("AKTİF-BEKLEMELİ", "ACTIVE"),
        ("AKTİF DEĞİL", "UNKNOWN"),
    ],
)
def test_explicit_status_not_overridden_by_generic_enrollment(text, status):
    lines = complete_lines()
    lines[10] = "Öğrencilik Durumu : " + text
    lines.append("Yukarıda belirtilen programın kayıtlı öğrencisi olduğu bildirilmiştir.")
    result = evaluated(lines)
    assert result["student_status"] == status
    assert result["student"]["status_text"] == text


def test_negative_attestation_is_not_active():
    lines = ek17()
    lines[14] = "Şubesi'nde 114 numara ile kayıtlı değildir; devamlı öğrencimiz değildir."
    assert evaluated(lines)["student_status"] == "UNKNOWN"


def test_meb_signer_name_is_not_student_identity():
    lines = ek17() + ["İMZALAYAN", "Adı Soyadı : Başka Kişi"]
    result = evaluated(lines)
    assert result["identity"]["full_name"] == "Örnek Öğrenci"
    assert "CONFLICT_NAME" not in result["warnings"]


def test_ek17_class_label_ocr_noise_does_not_enter_value():
    lines = ek17()
    lines[13] = "Yukarıda açık kimliği yazılı Örnek Öğrenci okulumuzun 8. o Sımf / A"
    assert evaluated(lines)["student"]["class_level"] == "8. Sınıf / A"


def test_known_education_label_diacritics_and_class_punctuation():
    lines = complete_lines()
    lines[9] = "Eğitim Türü / Öğrenim Süresi : ORGUN OGRETIM / 4"
    lines[11] = "Sınıf : 4, SINIF"
    result = evaluated(lines)
    assert result["student"]["education_type"] == "ÖRGÜN ÖĞRETİM"
    assert result["student"]["class_level"] == "4. SINIF"


def test_value_confidence_excludes_punctuation_but_not_uncertain_value():
    source = artifact(complete_lines(), method="OCR", confidence=0.5)
    block = source["blocks"][4]
    block["words"] = [
        {"text": word, "bbox": block["bbox"], "confidence": confidence}
        for word, confidence in [
            ("Adı", 0.96),
            ("Soyadı", 0.97),
            (":", 0),
            ("Örnek", 0.96),
            ("Öğrenci", 0.97),
        ]
    ]
    result = validate(parse(source, "STUDENT"), "STUDENT", verified=True, ocr_done=True)
    assert result["identity"]["full_name"] == "Örnek Öğrenci"
    block["words"][-1]["confidence"] = 0.4
    result = validate(parse(source, "STUDENT"), "STUDENT", verified=True, ocr_done=True)
    assert result["field_states"]["name"] == "UNREADABLE"


def test_retry_variants_do_not_concatenate_and_real_conflict_is_retained():
    source = artifact(complete_lines(), method="OCR", confidence=0.96)
    block = copy.deepcopy(source["blocks"][4])
    block.update(block_id="retry", variant="retry", text="Adı / Soyadı : Farklı Öğrenci")
    source["blocks"].append(block)
    result = validate(parse(source, "STUDENT"), "STUDENT", verified=True, ocr_done=True)
    assert result["field_states"]["name"] == "CONFLICT"
    assert not result["identity"]["full_name"]


@pytest.mark.parametrize("fmt", ["JPEG", "PNG"])
def test_image_normalization_and_content_detection(fmt):
    source = io.BytesIO()
    Image.new("RGB", (200, 300), "white").save(source, format=fmt)
    assert identify(source.getvalue()) == fmt
    data = normalize(source.getvalue())
    with pymupdf.open(stream=data, filetype="pdf") as pdf:
        assert len(pdf) == 1
        assert pdf[0].rect.height > pdf[0].rect.width


def test_exif_orientation_applied():
    source = io.BytesIO()
    exif = Image.Exif()
    exif[274] = 6
    Image.new("RGB", (200, 300), "white").save(source, format="JPEG", exif=exif)
    with pymupdf.open(stream=normalize(source.getvalue()), filetype="pdf") as pdf:
        assert pdf[0].rect.width > pdf[0].rect.height


@pytest.mark.parametrize(
    "data,code", [(b"not-a-pdf", "FORMAT_UNSUPPORTED"), (b"\xff\xd8\xffbroken", "IMAGE_INVALID")]
)
def test_invalid_format_and_corrupt_image(data, code):
    with pytest.raises(DomainError, match=code):
        normalize(data)


def test_image_pixel_limit(monkeypatch):
    monkeypatch.setattr("services.ingestion.formats.MAX_IMAGE_PIXELS", 100)
    source = io.BytesIO()
    Image.new("RGB", (20, 20)).save(source, format="PNG")
    with pytest.raises(DomainError, match="IMAGE_TOO_LARGE"):
        normalize(source.getvalue())


def test_word_contract_v2_and_coordinate_inverse():
    source = artifact(["Örnek"], method="OCR", confidence=0.95)
    source["schema_version"] = 2
    block = source["blocks"][0]
    block.update(
        variant="base", words=[{"text": "Örnek", "bbox": block["bbox"], "confidence": 0.95}]
    )
    output_schema(source, "OCR")
    block["words"][0]["bbox"][0] = float("nan")
    with pytest.raises(DomainError, match="INVALID_OUTPUT"):
        output_schema(source, "OCR")
    assert _bbox([10, 20, 30, 40], np.array([[0.5, 0, 5], [0, 0.5, 10], [0, 0, 1.0]])) == [
        10,
        20,
        20,
        30,
    ]


def test_uniform_photo_preserves_geometry():
    image = np.full((300, 200, 3), 240, dtype=np.uint8)
    corrected, matrix = _photo(image)
    assert corrected.shape == image.shape[:2]
    assert np.allclose(matrix, np.eye(3))


def test_separator_crop_does_not_remove_leading_letter():
    import cv2

    from services.ocr.tesseract import _trim_separator

    image = np.full((70, 350, 3), 255, dtype=np.uint8)
    cv2.putText(image, "AHMET", (2, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 0), 2)
    _, removed = _trim_separator(image)
    assert removed == 0
    image = np.full((70, 350, 3), 255, dtype=np.uint8)
    cv2.putText(image, ": AHMET", (2, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 0), 2)
    cropped, removed = _trim_separator(image)
    assert 0 < removed < 25
    assert cropped.shape[1] == 350 - removed


def test_detached_name_punctuation_is_not_a_value_conflict():
    source = artifact(ek17(), method="OCR", confidence=0.96)
    retry = copy.deepcopy(source["blocks"][8])
    retry.update(block_id="retry-name", variant="retry", text="Adı Soyadı : Örnek Öğrenci ,")
    source["blocks"].append(retry)
    result = validate(parse(source, "STUDENT"), "STUDENT", verified=True, ocr_done=True)
    assert result["identity"]["full_name"] == "Örnek Öğrenci"
    assert "CONFLICT_NAME" not in result["warnings"]


def test_truncated_class_branch_is_unreadable_not_partial_success():
    lines = ek17()
    lines[13] = "Yukarıda açık kimliği yazılı Örnek Öğrenci okulumuzun 8. Sınıf /"
    result = evaluated(lines)
    assert result["student"]["class_level"] == ""
    assert result["field_states"]["class_level"] == "UNREADABLE"
    assert result["student"]["student_number"] == "114"


def test_school_prose_word_confidence_is_field_specific():
    source = artifact(ek17(), method="OCR", confidence=0.96)
    for index in (13, 14):
        block = source["blocks"][index]
        block["words"] = [
            {"text": word, "bbox": block["bbox"], "confidence": 0.1 if word == "yazılı" else 0.96}
            for word in block["text"].split()
        ]
    result = validate(parse(source, "STUDENT"), "STUDENT", verified=True, ocr_done=True)
    assert result["student_status"] == "ACTIVE"
    assert result["student"]["student_number"] == "114"


def test_barcode_from_decoder_works_for_meb():
    lines = ek17() + ["Barkod No : MEB1234567890123456"]
    result = evaluated(lines)
    assert result["document_metadata"]["barcode"] == "MEB1234567890123456"


def test_orientation_maps_back_to_original_page(monkeypatch):
    import subprocess
    import time

    from services.ocr.tesseract import _orient

    monkeypatch.setattr(
        subprocess,
        "run",
        lambda *a, **kw: subprocess.CompletedProcess(
            a, 0, stdout=b"Rotate: 90\nOrientation confidence: 20.0\n"
        ),
    )
    image = np.full((80, 40, 3), 255, dtype=np.uint8)
    rotated, matrix = _orient(image, time.monotonic() + 10)
    assert rotated.shape == (40, 80, 3)
    assert _bbox([59, 10, 69, 20], np.linalg.inv(matrix)) == [10, 10, 20, 20]


def test_ingestion_scans_before_image_decode(monkeypatch):
    from uuid import uuid4

    from apps.processing.pipeline_tasks import run_stage

    order = []

    def call(action, *args, **kwargs):
        if action == "claim":
            return {"lease": "test-lease"}
        if action == "input":
            return b"image"
        if action == "complete-binary":
            order.append("complete")
        if action == "failed":
            order.append("failed")

    monkeypatch.setattr("services.internal_client.call", call)
    monkeypatch.setattr("services.ingestion.scanner.scan", lambda data: order.append("scan"))
    monkeypatch.setattr(
        "services.ingestion.formats.normalize", lambda data: order.append("decode") or b"%PDF-"
    )
    payload = {
        "schema_version": 1,
        "document_id": str(uuid4()),
        "job_id": str(uuid4()),
        "correlation_id": str(uuid4()),
        "operation": "INGEST",
    }
    run_stage.run(payload)
    assert order == ["scan", "decode", "complete"]


@pytest.mark.django_db
@pytest.mark.parametrize("fmt", ["JPEG", "PNG"])
@pytest.mark.parametrize("source_type", ["UPLOAD", "URL", "BATCH"])
def test_image_ingestion_encrypted_result_and_reports(
    document_context, personnel, fmt, source_type, settings
):
    import json

    from django.db import transaction

    from apps.core.internal import intake, reanalyze
    from apps.core.reports import REPORT_HEADERS, pdf_report, report_values
    from apps.core.results import read_result
    from apps.documents.models import BatchRow, Document, UploadBatch
    from apps.processing import orchestrator as flow
    from apps.processing.models import ProcessingJob
    from services.extraction.pdf import extract
    from services.ingestion import ephemeral
    from services.ingestion.crypto import open_value

    settings.VERIFIED_PROFILES = {"STUDENT:student-documents-v5"}
    image = io.BytesIO()
    Image.new("RGB", (200, 300), "white").save(image, format=fmt)
    row = None
    if source_type == "BATCH":
        batch = UploadBatch.objects.create(created_by=personnel[0])
        row = BatchRow.objects.create(batch=batch, number=1, document_type="STUDENT")
    settings.SOURCE_POLICIES = {"allowed.example": ["93.184.216.0/24"]}
    incoming = (
        {"url": "https://allowed.example/synthetic.jpg"}
        if source_type == "URL"
        else {"data": image.getvalue()}
    )
    with transaction.atomic():
        response, status = intake(personnel[0], "STUDENT", source_type, row=row, **incoming)
    assert status == 202
    doc = Document.objects.get(pk=response["document_id"])
    if source_type == "URL":
        work = flow.claim(doc.current_job_id, "FETCH", "fetch")
        flow.complete(doc.current_job_id, work["lease"], "fetch", binary=image.getvalue())
    if row:
        row.refresh_from_db()
        assert row.document_id == doc.id
    work = flow.claim(doc.current_job_id, "INGEST", "orchestration")
    flow.complete(
        doc.current_job_id, work["lease"], "orchestration", binary=normalize(image.getvalue())
    )
    doc.refresh_from_db()
    job = ProcessingJob.objects.get(pk=doc.current_job_id)
    assert ephemeral.read(doc.id, "SOURCE_FORMAT") == fmt.encode()
    work = flow.claim(job.id, "EXTRACT", "extraction")
    output = extract(ephemeral.read(doc.id, "ORIGINAL"))
    flow.complete(job.id, work["lease"], "extraction", output=output)
    work = flow.claim(job.id, "EVALUATE", "evaluation")
    result = evaluated(ek17())
    flow.complete(job.id, work["lease"], "evaluation", output=result)
    public = read_result(doc)
    assert public["document_metadata"]["source_format"] == fmt
    assert public["field_states"]["barcode"] == "NOT_PRESENT"
    assert public["student"]["status"] == public["student_status"] == "ACTIVE"
    assert IDENTITY not in json.dumps(public)
    sealed = job.result.details_cipher
    assert "Örnek" not in json.dumps(sealed)
    details = json.loads(open_value(sealed, f"result-details:{job.id}"))
    assert details["schema_version"] == 7
    values = dict(zip(REPORT_HEADERS, report_values(doc, public), strict=True))
    assert fmt in values.values()
    assert "Belgede yok" in values.values()
    with pymupdf.open(stream=pdf_report(doc, public), filetype="pdf") as report:
        text = " ".join(page.get_text() for page in report)
        assert fmt in text and "Örnek" in text
    with transaction.atomic():
        response, status = reanalyze(personnel[0], doc.id, data=image.getvalue())
    assert status == 202 and str(job.id) != response["job_id"]
    assert read_result(doc, job.id)["document_metadata"]["source_format"] == fmt
