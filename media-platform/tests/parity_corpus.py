"""Zero-regression parity korpusu (yalniz dijital-PDF yolu).

Korpus, tasinan document_control domain testlerinin kullandigi AYNI sentetik
fixture ureticilerinden (`artifact`, `complete_lines`, `meb_lines`, `ek17`,
criminal `lines`) kurulur; boylece referans suite ile birebir ayni girdiler
engine'lerden gecer. Her vaka `(name, document_type, extraction)` uclusudur ve
`services.evaluation.rules.parse` + `validate` ciktilari golden'a karsi
alan-alan kiyaslanir.
"""

from tests.test_criminal_v6 import lines as criminal_lines
from tests.test_student_v5 import ek17
from tests.test_yok_student_v3 import artifact, complete_lines, meb_lines


def _eval_cases():
    return [
        ("yok_complete", "STUDENT", artifact(complete_lines())),
        ("yok_name_plain", "STUDENT", artifact(complete_lines(name_label="Adı Soyadı"))),
        ("yok_status_colon", "STUDENT", artifact(complete_lines(status_separator=":"))),
        ("meb_sectioned", "STUDENT", artifact(meb_lines(sectioned=True))),
        ("meb_standard", "STUDENT", artifact(meb_lines(sectioned=False))),
        ("ek17", "STUDENT", artifact(ek17())),
        ("criminal_full", "CRIMINAL_RECORD", artifact(criminal_lines(archive=True))),
        ("criminal_no_archive", "CRIMINAL_RECORD", artifact(criminal_lines(archive=False))),
        (
            "criminal_ocr",
            "CRIMINAL_RECORD",
            artifact(criminal_lines(archive=True), method="OCR", confidence=0.99),
        ),
    ]


# Degerlendirme (parse + validate) vakalari: detection cikti paritesi.
EVAL_CASES = _eval_cases()
