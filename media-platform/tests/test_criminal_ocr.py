import copy
import subprocess
import time

import cv2
import numpy as np
import pytest

from services.evaluation.rules import parse, validate
from services.ocr import tesseract
from tests.test_criminal_v6 import evaluate, lines
from tests.test_yok_student_v3 import artifact


def optical(archive=False):
    source = artifact(lines(archive), method="OCR", confidence=0.99)
    source["schema_version"] = 2
    for block in source["blocks"]:
        block.update(words=[], variant="base")
    return source


def test_tsv_quotes_do_not_swallow_following_words(monkeypatch):
    header = (
        "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\t"
        "left\ttop\twidth\theight\tconf\ttext\n"
    )
    tsv = header + '5\t1\t1\t1\t1\t1\t5\t5\t4\t8\t90\t"\n'
    tsv += "5\t1\t1\t1\t1\t2\t15\t5\t40\t8\t99\tÖRNEK\n"
    monkeypatch.setattr(
        tesseract.subprocess,
        "run",
        lambda *a, **kw: subprocess.CompletedProcess(a, 0, stdout=tsv.encode()),
    )
    result = tesseract._read(
        np.full((25, 60, 3), 255, np.uint8), np.eye(3), 1, "test", time.monotonic() + 5
    )
    assert [w["text"] for w in result[0]["words"]] == ['"', "ÖRNEK"]
    assert "\n" not in result[0]["text"]


def test_targeted_identity_inherits_section_but_not_signatory():
    source = optical(True)
    name = next(b for b in source["blocks"] if b["text"].startswith("AD, SOYAD"))
    name["confidence"] = 0.5
    retry = name | {"block_id": "target-name", "variant": "criminal-value1-0", "confidence": 0.99}
    source["blocks"].append(retry)
    source["blocks"][9]["text"] = "SORGULAMA YA ESAS KİMLİK BİLGİLERİ"
    assert evaluate(source)["identity"]["full_name"] == "Örnek İsim Soyisim"
    retry["bbox"] = [40, 700, 550, 715]
    assert evaluate(source)["identity"]["full_name"] == ""


def test_targeted_reliable_conflicts_are_not_voted_away():
    source = optical(True)
    name = next(b for b in source["blocks"] if b["text"].startswith("AD, SOYAD"))
    source["blocks"].append(
        name
        | {
            "block_id": "target-name",
            "variant": "criminal-value1-0",
            "text": "AD, SOYAD : Başka İsim",
        }
    )
    result = evaluate(source)
    assert result["field_states"]["name"] == "CONFLICT"
    assert result["identity"]["full_name"] == ""


def test_composite_criminal_labels_are_not_replaced_by_student_labels():
    source = optical(True)
    # Split labels/values as Tesseract's automatic column segmentation can do.
    base = []
    for block in source["blocks"]:
        if " : " not in block["text"]:
            continue
        label, value = block["text"].split(" : ", 1)
        left, right = copy.deepcopy(block), copy.deepcopy(block)
        left.update(text=label, bbox=[40, block["bbox"][1], 200, block["bbox"][3]])
        right.update(
            text=": " + value,
            block_id=block["block_id"] + "-value",
            bbox=[210, block["bbox"][1], 550, block["bbox"][3]],
        )
        for b in (left, right):
            b["words"] = [{"text": b["text"], "bbox": b["bbox"], "confidence": 0.99}]
        base.extend((left, right))
    labels = [
        label
        for _, label, _ in tesseract._value_regions(
            base, source["pages"][0], all_values=True, criminal=True
        )
    ]
    assert "ANNE ADI / BABA ADI" in labels
    assert "DOGUM YERI / TARIHI" in labels
    assert "ANNE ADI" not in labels


@pytest.mark.parametrize("extra_ink", [False, True])
def test_archive_absence_requires_blank_pixels_not_ocr_silence(extra_ink):
    source = optical(False)
    note = next(b for b in source["blocks"] if b["text"].startswith("NOT:"))
    note["bbox"] = [40, 490, 550, 505]
    image = np.full((842, 595, 3), 255, np.uint8)
    if extra_ink:
        # Even very faint text missed by OCR must invalidate the absence proof.
        cv2.putText(image, "ARCHIVE", (40, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (235, 235, 235), 1)
    marker = tesseract._blank_criminal_results(
        image, np.eye(3), source["blocks"], source["pages"][0]
    )
    assert bool(marker) is not extra_ink
    source["blocks"].extend(marker)
    result = evaluate(source)
    assert result["field_states"]["archive"] == ("UNREADABLE" if extra_ink else "NOT_PRESENT")
    assert result["archive_status"] == "UNKNOWN"


def test_rule_line_is_not_confused_with_unread_text():
    image = np.zeros((80, 500), np.uint8)
    cv2.line(image, (30, 40), (270, 40), 1, 2)
    cv2.line(image, (40, 30), (40, 50), 1, 2)
    cv2.line(image, (260, 30), (260, 50), 1, 2)
    assert tesseract._only_rule_line(image > 0)
    cv2.putText(image, "RECORD", (300, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1, 1)
    assert not tesseract._only_rule_line(image > 0)


def test_crop_conflicts_still_conflict_with_native_pdf():
    source = optical(True)
    native = artifact(lines(True))
    next(b for b in native["blocks"] if b["text"].startswith("KULLANIM"))["text"] = (
        "KULLANIM AMACI : Farklı kurum"
    )
    result = validate(
        parse(source, "CRIMINAL_RECORD"),
        "CRIMINAL_RECORD",
        parse(native, "CRIMINAL_RECORD"),
        True,
        True,
    )
    assert result["field_states"]["query_purpose"] == "CONFLICT"
