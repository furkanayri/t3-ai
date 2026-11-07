from types import SimpleNamespace

import pymupdf
from platform_core import timeshim as timezone

from platform_core.reports import csv_report, pdf_report
from services.evaluation.contracts import result_schema
from services.evaluation.rules import parse, validate
from tests.synthetic import IDENTITY


def artifact(lines, *, method="PDF_TEXT", confidence=None):
    blocks = []
    for index, line in enumerate(lines):
        if isinstance(line, tuple):
            text, bbox = line
        else:
            text, bbox = line, [40, 50 + index * 20, 550, 65 + index * 20]
        blocks.append(
            {
                "block_id": f"b{index}",
                "page": 1,
                "bbox": bbox,
                "text": text,
                "confidence": confidence,
            }
        )
    return {
        "schema_version": 1,
        "method": method,
        "engine_version": "synthetic",
        "pages": [{"page": 1, "width": 595, "height": 842, "rotation": 0}],
        "processed_pages": [1],
        "blocks": blocks,
    }


def complete_lines(*, status_separator=";", name_label="Adı / Soyadı"):
    return [
        "YÜKSEKÖĞRETİM KURULU ÖĞRENCİ BELGESİ",
        ("ABCDEF1234567890", [350, 10, 520, 25]),
        ("02.01.2024", [350, 30, 460, 45]),
        f"T.C. Kimlik No : {IDENTITY}",
        f"{name_label} : Örnek Öğrenci",
        "Anne Adı : Örnek Anne",
        "Baba Adı : Örnek Baba",
        "Doğum Tarihi / Uyruğu : 03.04.2000 / TÜRKİYE CUMHURİYETİ",
        "Kayıt Tarihi . 05.09.2020",
        "Eğitim Türü / Öğrenim Süresi (o: ÖRGÜN ÖĞRETİM / 4",
        f"Öğrencilik Durumu {status_separator} AKTİF ÖĞRENCİ",
        "Sınıf : 4. SINIF",
        "Program : ÖRNEK ÜNİVERSİTESİ / MÜHENDİSLİK FAKÜLTESİ /",
        "BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ / BİLGİSAYAR MÜHENDİSLİĞİ PR.",
        "İLGİLİ MAKAMA",
    ]


def meb_lines(*, sectioned=False):
    common = [
        "MİLLİ EĞİTİM BAKANLIĞI",
        "ÖĞRENCİ BELGESİ",
        ("MEB1234567890123456", [350, 10, 520, 25]),
        ("12.09.2026 13:46", [350, 30, 460, 45]),
    ]
    if sectioned:
        return common + [
            "OKULUN",
            "İli : Örnek İl",
            "İlçesi : Örnek İlçe",
            "Adı : (123456) Örnek Ortaokulu",
            "ÖĞRENCİNİN",
            "Adı soyadı : Örnek Öğrenci",
            f"T.C. Kimlik No : {IDENTITY}",
            "Baba Adı : Örnek Baba",
            "Ana Adı : Örnek Anne",
            "Doğum Yeri : Örnek Yer",
            "Doğum Tarihi : 03.04.2012",
            "Belgenin Alındığı Tarih : 12.09.2026 13:46",
            "Yukarıda belirtilen okulda 8. Sınıf-İmam Hatip / H Şubesi'nde "
            "323 okul numarası ile kayıtlıdır.",
        ]
    return common + [
        "Öğrencinin Adı soyadı : Örnek Öğrenci",
        f"T.C. Kimlik Numarası : {IDENTITY}",
        "Baba Adı : Örnek Baba",
        "Ana Adı : Örnek Anne",
        "Doğum Yeri : Örnek Yer",
        "Doğum Tarihi : 03.04.2012",
        "Okulun İli/İlçesi : Örnek İl / Örnek İlçe",
        "Okul Adı : (123456) Örnek Lisesi",
        "Alanı : Fen Bilimleri",
        "Dalı : Dalı Yok",
        "Sınıfı : 11. Sınıf / A Şubesi",
        "Öğrenci Numarası : 144",
        "Öğrenci Belgesinin Alındığı Tarih : 12.09.2026 13:46",
        "Burslu / Yatılı : - / -",
        "Yukarıda belirtilen okulda 12.09.2026 tarihi itibari ile kayıtlıdır.",
    ]


def test_yok_v3_extracts_all_structured_fields_from_ocr_variants():
    findings = parse(artifact(complete_lines(), method="OCR", confidence=0.96), "STUDENT")
    result = result_schema(validate(findings, "STUDENT", verified=True, ocr_done=True))

    assert result["schema_version"] == 7
    assert result["document_family"] == "YOK"
    assert result["student_status"] == "ACTIVE"
    for key, expected in {
        "tckn": IDENTITY,
        "full_name": "Örnek Öğrenci",
        "mother_name": "Örnek Anne",
        "father_name": "Örnek Baba",
        "birth_date": "2000-04-03",
        "nationality": "TÜRKİYE CUMHURİYETİ",
    }.items():
        assert result["identity"][key] == expected
    assert result["document_metadata"] == {
        "barcode": "ABCDEF1234567890",
        "issue_date": "2024-01-02",
        "layout": "YOK_EDEVLET",
        "source_format": "PDF",
        "subtype": "ENROLLMENT",
    }
    assert result["student"] == {
        "university": "ÖRNEK ÜNİVERSİTESİ",
        "faculty": "MÜHENDİSLİK FAKÜLTESİ",
        "department": "BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ",
        "program": "BİLGİSAYAR MÜHENDİSLİĞİ PR",
        "registration_date": "2020-09-05",
        "education_type": "ÖRGÜN ÖĞRETİM",
        "education_duration_years": 4,
        "status": "ACTIVE",
        "status_text": "AKTİF ÖĞRENCİ",
        "class_level": "4. SINIF",
        "school_location": "",
        "school_name": "",
        "education_field": "",
        "education_branch": "",
        "student_number": "",
        "scholarship_boarding": "",
    }
    assert not result["warnings"]
    assert {proof["field"] for proof in result["evidence"]} >= {
        "name",
        "student",
        "program",
        "barcode",
    }


def test_meb_standard_layout_extracts_all_visible_fields():
    findings = parse(artifact(meb_lines(), method="OCR", confidence=0.96), "STUDENT")
    result = result_schema(validate(findings, "STUDENT", verified=True, ocr_done=True))

    assert result["document_family"] == "MEB"
    assert result["student_status"] == "ACTIVE"
    assert result["identity"]["birth_place"] == "Örnek Yer"
    assert result["student"]["school_location"] == "Örnek İl / Örnek İlçe"
    assert result["student"]["school_name"] == "(123456) Örnek Lisesi"
    assert result["student"]["education_field"] == "Fen Bilimleri"
    assert result["student"]["education_branch"] == "Dalı Yok"
    assert result["student"]["class_level"] == "11. Sınıf / A Şubesi"
    assert result["student"]["student_number"] == "144"
    assert not result["warnings"]


def test_meb_without_enrollment_evidence_is_not_active():
    lines = meb_lines()[:-1]
    result = validate(parse(artifact(lines), "STUDENT"), "STUDENT", verified=True, ocr_done=True)
    assert result["student_status"] == "UNKNOWN"
    assert "UNKNOWN_STUDENT" in result["warnings"]


def test_meb_low_confidence_enrollment_does_not_become_certain():
    findings = parse(artifact(meb_lines(sectioned=True), method="OCR", confidence=0.5), "STUDENT")
    result = validate(findings, "STUDENT", verified=True, ocr_done=True)
    assert result["student_status"] == "UNKNOWN"


def test_meb_sectioned_layout_extracts_school_and_narrative_fields():
    findings = parse(
        artifact(meb_lines(sectioned=True), method="OCR", confidence=0.96), "STUDENT"
    )
    result = result_schema(validate(findings, "STUDENT", verified=True, ocr_done=True))

    assert result["document_family"] == "MEB"
    assert result["student_status"] == "ACTIVE"
    assert result["student"]["school_location"] == "Örnek İl / Örnek İlçe"
    assert result["student"]["school_name"] == "(123456) Örnek Ortaokulu"
    assert result["student"]["class_level"] == "8. SINIF-IMAM HATIP / H SUBESI"
    assert result["student"]["student_number"] == "323"
    assert not result["warnings"]


def test_fragmented_pdf_blocks_are_joined_by_visual_row():
    lines = complete_lines()
    lines[3:5] = [
        (IDENTITY, [310, 110, 400, 125]),
        ("T.C. Kimlik No", [40, 110, 155, 125]),
        (":", [280, 110, 285, 125]),
        ("Adı / Soyadı", [40, 130, 155, 145]),
        ("Örnek Öğrenci", [310, 130, 430, 145]),
        (":", [280, 130, 285, 145]),
    ]
    findings = parse(artifact(lines), "STUDENT")

    assert findings["fields"]["identity"][0]["value"] == IDENTITY
    assert findings["fields"]["name"][0]["value"] == "Örnek Öğrenci"
    assert findings["fields"]["name"][0]["evidence"]["bbox"] == [40, 130, 430, 145]


def test_unreliable_pdf_text_prefers_ocr_without_false_conflict():
    bad = artifact(complete_lines())
    for block in bad["blocks"]:
        if "Adı / Soyadı" in block["text"]:
            block["text"] = "Adı / Soyadı : Bozuk �sim"
    pdf_findings = parse(bad, "STUDENT")
    ocr_findings = parse(artifact(complete_lines(), method="OCR", confidence=0.96), "STUDENT")

    result = validate(
        ocr_findings,
        "STUDENT",
        previous=pdf_findings,
        verified=True,
        ocr_done=True,
    )

    assert result["identity"]["full_name"] == "Örnek Öğrenci"
    assert "CONFLICT_NAME" not in result["warnings"]


def test_real_pdf_ocr_disagreement_stays_unknown():
    pdf_findings = parse(artifact(complete_lines()), "STUDENT")
    different = complete_lines()
    different[4] = "Adı / Soyadı : Farklı Öğrenci"
    ocr_findings = parse(artifact(different, method="OCR", confidence=0.96), "STUDENT")

    result = validate(
        ocr_findings,
        "STUDENT",
        previous=pdf_findings,
        verified=True,
        ocr_done=True,
    )

    assert result["identity"]["full_name"] == ""
    assert "CONFLICT_NAME" in result["warnings"]


def test_cosmetic_class_punctuation_is_not_a_conflict():
    pdf_findings = parse(artifact(complete_lines()), "STUDENT")
    ocr_lines = complete_lines()
    ocr_lines[11] = "Sınıf : 4.SINIF"
    ocr_findings = parse(artifact(ocr_lines, method="OCR", confidence=0.96), "STUDENT")

    result = validate(
        ocr_findings,
        "STUDENT",
        previous=pdf_findings,
        verified=True,
        ocr_done=True,
    )

    assert result["student"]["class_level"] == "4. SINIF"
    assert "CONFLICT_CLASS_LEVEL" not in result["warnings"]


def test_low_confidence_and_signer_identity_are_not_accepted():
    lines = complete_lines() + [
        "İmzalayan",
        "Adı / Soyadı : Belgeyi İmzalayan",
    ]
    findings = parse(artifact(lines, method="OCR", confidence=0.60), "STUDENT")
    result = validate(findings, "STUDENT", verified=True, ocr_done=True)

    assert result["identity"]["full_name"] == ""
    assert "UNKNOWN_NAME" in result["warnings"]
    assert all(
        candidate["value"] != "Belgeyi İmzalayan"
        for candidate in result["identity"]["candidates"]
    )


def test_v3_csv_and_pdf_reports_include_new_fields():
    findings = parse(artifact(complete_lines(), method="OCR", confidence=0.96), "STUDENT")
    parsed = validate(findings, "STUDENT", verified=True, ocr_done=True)
    result = parsed | {
        "job_id": "00000000-0000-0000-0000-000000000001",
        "rule_version": "rules-v4",
        "profile_version": "student-documents-v3",
        "created_at": timezone.now().isoformat(),
        "identity": parsed["identity"]
        | {"tckn_mask": "*******0146", "tckn": ""},
    }
    document = SimpleNamespace(
        id="00000000-0000-0000-0000-000000000002",
        document_type="STUDENT",
        processing_status="COMPLETED",
        error_code="",
    )

    csv_text = csv_report([(document, result)])
    assert "Üniversite" in csv_text and "ÖRNEK ÜNİVERSİTESİ" in csv_text
    assert "Öğrenim süresi (yıl)" in csv_text
    with pymupdf.open(stream=pdf_report(document, result), filetype="pdf") as report:
        pdf_text = "".join(page.get_text() for page in report)
    assert "ÖRNEK ÜNİVERSİTESİ" in pdf_text
    assert "Öğrenim süresi" in pdf_text and "4 yıl" in pdf_text
