import copy
import json

import pytest

from platform_core.errors import DomainError
from services.evaluation.contracts import result_schema
from services.evaluation.rules import parse, rules_for, validate
from tests.synthetic import IDENTITY
from tests.test_yok_student_v3 import artifact


def lines(archive=True):
    result = [
        "ADB12345678901",
        "TÜRKİYE CUMHURİYETİ",
        "ADALET BAKANLIĞI",
        "ADLİ SİCİL VE İSTATİSTİK GENEL MÜDÜRLÜĞÜ",
        "SAYI : 0000-2026-1234567890 / 13:42",
        "YER / TARİH : İNTERNET (www.turkiye.gov.tr) / 20.10.2026",
        "SORGU TÜRÜ : DİĞER",
        "KULLANIM AMACI : Örnek kurum",
        "KİMLİK TÜRÜ : MERNİS",
        "SORGULAMAYA ESAS KİMLİK BİLGİLERİ",
        f"KİMLİK NUMARASI : {IDENTITY}",
        "AD, SOYAD : Örnek İsim, Soyisim",
        "ANNE ADI / BABA ADI : Örnek Anne / Örnek Baba",
        "DOĞUM YERİ / TARİHİ : Örnek Yer/Ülke / 03.04.2000",
        "NÜFUSA KAYITLI OLDUĞU YER : Örnek İl",
        "ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI :",
        "YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR.",
    ]
    if archive:
        result.append("YUKARIDA KİMLİK BİLGİLERİ BULUNAN ŞAHSIN ADLİ SİCİL ARŞİV KAYDI YOKTUR.")
    return result + ["NOT: BU SORGULAMA KİMLİK BİLGİLERİNE GÖRE YAPILMIŞTIR.", "1/1"]


def evaluate(source, previous=None, verified=True):
    return result_schema(
        validate(parse(source, "CRIMINAL_RECORD"), "CRIMINAL_RECORD", previous, verified, True)
    )


def test_all_fields_and_schema():
    result = evaluate(artifact(lines()))
    assert result["schema_version"] == 6
    assert result["document_metadata"] == {
        "barcode": "ADB12345678901",
        "issue_date": "2026-10-20",
        "layout": "CRIMINAL_EDEVLET",
        "source_format": "PDF",
    }
    assert result["identity"]["full_name"] == "Örnek İsim Soyisim"
    assert result["identity"]["mother_name"] == "Örnek Anne"
    assert result["identity"]["father_name"] == "Örnek Baba"
    assert result["identity"]["birth_place"] == "Örnek Yer/Ülke"
    assert result["identity"]["birth_date"] == "2000-04-03"
    assert result["criminal_record"]["query_time"] == "13:42"
    assert result["criminal_record"]["query_number"] == "0000-2026-1234567890"
    assert result["criminal_record"]["registered_location"] == "Örnek İl"
    assert result["criminal_status"] == result["archive_status"] == "NONE"
    assert not result["warnings"]
    assert rules_for("CRIMINAL_RECORD") == "rules-v6"
    assert rules_for("STUDENT") == "rules-v7"
    assert all(p["bbox"][2] > p["bbox"][0] for p in result["evidence"])


@pytest.mark.parametrize("method,expected", [("PDF_TEXT", "NOT_PRESENT"), ("OCR", "UNREADABLE")])
def test_absent_archive_is_never_a_negative_record(method, expected):
    result = evaluate(
        artifact(lines(False), method=method, confidence=0.99 if method == "OCR" else None)
    )
    assert result["archive_status"] == "UNKNOWN"
    assert result["field_states"]["archive"] == expected
    assert ("UNKNOWN_ARCHIVE" in result["warnings"]) == (method == "OCR")


@pytest.mark.parametrize("mutation", ["footer", "second_page", "archive_heading"])
def test_incomplete_form_cannot_assert_archive_absence(mutation):
    source = artifact(lines(False))
    if mutation == "footer":
        source["blocks"] = source["blocks"][:-2]
    elif mutation == "second_page":
        source["pages"].append(source["pages"][0] | {"page": 2})
    else:
        source["blocks"].insert(
            -2, source["blocks"][-3] | {"text": "ADLİ SİCİL ARŞİV KAYDI ...", "block_id": "damaged"}
        )
    assert evaluate(source)["field_states"]["archive"] == "UNREADABLE"


def test_fragmented_columns_and_wrapped_result():
    source = lines()
    source[11] = ("AD, SOYAD", [40, 270, 180, 285])
    source.insert(12, (": Örnek İsim, Soyisim", [220, 270, 500, 285]))
    source[-4:-3] = ["YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN", "ADLİ SİCİL KAYDI YOKTUR."]
    result = evaluate(artifact(source))
    assert result["identity"]["full_name"] == "Örnek İsim Soyisim"
    assert result["criminal_status"] == "NONE"


@pytest.mark.parametrize(
    "sentence",
    [
        "ÖRNEK: ADLİ SİCİL KAYDI YOKTUR.",
        "ADLİ SİCİL KAYDI YOKTUR İSE BELGE KABUL EDİLİR.",
        "YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR DENİLEMEZ.",
    ],
)
def test_explanation_and_negation_are_not_status(sentence):
    source = lines()
    source[16] = sentence
    assert evaluate(artifact(source))["criminal_status"] == "UNKNOWN"


def test_conflicting_status_and_signatory_are_not_selected():
    source = lines()
    source.insert(17, source[16].replace("YOKTUR", "VARDIR"))
    source += ["İMZALAYAN", "AD, SOYAD : Yanlış Kişi"]
    result = evaluate(artifact(source))
    assert result["criminal_status"] == "UNKNOWN"
    assert "CONFLICT_CRIMINAL" in result["warnings"]
    assert result["identity"]["full_name"] == "Örnek İsim Soyisim"


def test_present_archive_is_independent():
    source = lines()
    source[17] = source[17].replace("YOKTUR", "VARDIR")
    result = evaluate(artifact(source))
    assert result["criminal_status"] == "NONE"
    assert result["archive_status"] == "PRESENT"
    assert "RECORD_PRESENT" in result["warnings"]


def test_invalid_date_and_broken_font_remain_unknown():
    source = lines()
    source[13] = source[13].replace("03.04.2000", "31.02.2000")
    source[11] = "AD, SOYAD : Örnek \ufffd"
    result = evaluate(artifact(source))
    assert not result["identity"]["full_name"]
    assert not result["identity"]["birth_date"]


def test_unverified_keeps_observed_statement_without_certifying_status():
    result = evaluate(artifact(lines()), verified=False)
    assert result["criminal_status"] == result["archive_status"] == "UNKNOWN"
    assert result["criminal_record"]["criminal_text"].endswith("YOKTUR.")
    assert "PROFILE_NOT_VERIFIED" in result["warnings"]


def test_contract_rejects_extra_keys_and_bad_time():
    result = evaluate(artifact(lines()))
    for field, value in [("query_time", "25:99"), ("unexpected", "x")]:
        damaged = copy.deepcopy(result)
        damaged["criminal_record"][field] = value
        with pytest.raises(DomainError, match="INVALID_OUTPUT"):
            result_schema(damaged)


def test_low_confidence_decisive_word_is_not_diluted_by_boilerplate():
    source = artifact(lines(), method="OCR", confidence=0.99)
    block = source["blocks"][16]
    block["words"] = [
        {"text": word, "bbox": block["bbox"], "confidence": 0.65 if word == "YOKTUR." else 0.99}
        for word in block["text"].split()
    ]
    result = evaluate(source)
    assert result["criminal_status"] == "UNKNOWN"
    assert result["criminal_record"]["criminal_text"] == ""


def test_pdf_ocr_conflict_and_multiple_documents_are_safe():
    original = parse(artifact(lines()), "CRIMINAL_RECORD")
    changed = lines()
    changed[16] = changed[16].replace("YOKTUR", "VARDIR")
    result = evaluate(artifact(changed, method="OCR", confidence=0.99), original)
    assert result["criminal_status"] == "UNKNOWN"
    assert "CONFLICT_CRIMINAL" in result["warnings"]
    changed = lines()
    changed.insert(1, "ADB98765432109")
    result = evaluate(artifact(changed))
    assert "MULTIPLE_DOCUMENTS" in result["warnings"]
    assert not result["identity"]["tckn"]


@pytest.mark.django_db
def test_encrypted_details_masking_and_reports(document_context, personnel, settings):
    from django.db import transaction

    from apps.core.internal import intake
    from apps.core.reports import REPORT_HEADERS, pdf_report, report_values
    from apps.core.results import read_result
    from apps.documents.models import Document
    from apps.processing import orchestrator as flow
    from services.extraction.pdf import extract
    from services.ingestion.crypto import open_value
    from tests.synthetic import pdf

    settings.VERIFIED_PROFILES = ["CRIMINAL_RECORD:criminal-record-v2"]
    data = pdf(lines())
    with transaction.atomic():
        response, _ = intake(personnel[0], "CRIMINAL_RECORD", "UPLOAD", data=data)
    doc = Document.objects.get(pk=response["document_id"])
    work = flow.claim(doc.current_job_id, "INGEST", "orchestration")
    flow.complete(doc.current_job_id, work["lease"], "orchestration", binary=data)
    doc.refresh_from_db()
    work = flow.claim(doc.current_job_id, "EXTRACT", "extraction")
    flow.complete(doc.current_job_id, work["lease"], "extraction", output=extract(data))
    work = flow.claim(doc.current_job_id, "EVALUATE", "evaluation")
    flow.complete(
        doc.current_job_id, work["lease"], "evaluation", output=evaluate(artifact(lines()))
    )
    doc.refresh_from_db()
    result = read_result(doc)
    assert result["schema_version"] == 6
    assert result["rule_version"] == "rules-v6"
    assert result["criminal_record"]["query_type"] == "DİĞER"
    assert IDENTITY not in json.dumps(result)
    assert read_result(doc, full=True)["tckn"] == IDENTITY
    from apps.processing.models import CheckResult

    stored = CheckResult.objects.get(job_id=doc.current_job_id).details_cipher
    assert "Örnek kurum" not in json.dumps(stored)
    details = json.loads(open_value(stored, f"result-details:{doc.current_job_id}"))
    assert details["criminal_record"]["query_purpose"] == "Örnek kurum"
    values = dict(zip(REPORT_HEADERS, report_values(doc, result), strict=True))
    assert values["Sorgu saati"] == "13:42"
    import pymupdf

    with pymupdf.open(stream=pdf_report(doc, result), filetype="pdf") as report:
        text = " ".join(page.get_text() for page in report)
        assert "Örnek kurum" in text and "13:42" in text
        assert "Üniversite" not in text and IDENTITY not in text
