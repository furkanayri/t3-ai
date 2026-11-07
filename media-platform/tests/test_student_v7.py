from platform_core.reports import student_status_label
from services.evaluation.barcodes import reconcile
from tests.synthetic import IDENTITY
from tests.test_student_v5 import evaluated
from tests.test_yok_student_v3 import complete_lines


def test_special_student_keeps_continuation():
    lines = complete_lines()
    lines[10] = "Öğrencilik Durumu : AKTİF ÖZEL ÖĞRENCİ (GİDEN) - ÖRNEK ÜNİVERSİTESİ/TIP"
    lines.insert(11, "FAKÜLTESİ/TIP PR./")
    result = evaluated(lines)
    assert result["student_status"] == "ACTIVE"
    assert result["student"]["status_text"].endswith("FAKÜLTESİ/TIP PR./")


def test_graduation_label_does_not_change_other_results():
    assert student_status_label({"student_status": "OTHER"}) == "Diğer"
    assert (
        student_status_label(
            {"student_status": "OTHER", "document_metadata": {"subtype": "GRADUATION"}}
        )
        == "Mezun"
    )


def test_same_symbol_ocr_difference_is_not_multiple_documents():
    candidates = [
        {
            "value": value,
            "reliable": True,
            "evidence": {
                "page": 1,
                "bbox": [350, 10, 520, 25],
                "block_id": "caption",
                "method": "OCR",
            },
        }
        for value in ("YOK123456O", "YOK1234560")
    ]
    selected, multiple = reconcile(candidates)
    assert len(selected) == 2
    assert not multiple
    candidates[1]["evidence"]["page"] = 2
    assert reconcile(candidates)[1]


def test_university_separate_names_and_combined_birth_field():
    result = evaluated(
        [
            "ÖRNEK ÜNİVERSİTESİ",
            "ÖĞRENCİ BELGESİ",
            f"T.C. Kimlik No : {IDENTITY}",
            "Adı : Örnek",
            "Soyadı : Öğrenci",
            "Doğum Tarihi / Doğum Yeri : 03.04.2000 / Örnek Yer",
            "Öğrenci No : 12345",
            "Akademik Birim : Örnek Enstitü",
            "Bölüm / Program : Birleşik Program",
            "Öğrenim Durumu : Aktif (E-Devletten Kayıt Yapan)",
            "Düzenlenme Tarihi : 02.10.2026",
        ]
    )
    assert result["document_family"] == "UNIVERSITY"
    assert result["identity"]["full_name"] == "Örnek Öğrenci"
    assert result["identity"]["birth_date"] == "2000-04-03"
    assert result["identity"]["birth_place"] == "Örnek Yer"
    assert result["student"]["program"] == "Birleşik Program"
    assert not result["student"]["department"]
    assert result["student_status"] == "ACTIVE"


def test_graduation_is_not_active_enrollment():
    result = evaluated(
        [
            "MİLLİ EĞİTİM BAKANLIĞI",
            "MEZUNİYET BELGESİ",
            f"T.C. Kimlik No : {IDENTITY}",
            "Adı Soyadı : Örnek Öğrenci",
            "Mezun Olduğu Okul : Örnek Lisesi",
            "Öğrenim Süresi : 4",
            "Yukarıda bilgileri yazılı öğrenci mezun olmuştur.",
        ]
    )
    assert result["student_status"] == "OTHER"
    assert result["document_metadata"]["subtype"] == "GRADUATION"
    assert student_status_label(result) == "Mezun"
