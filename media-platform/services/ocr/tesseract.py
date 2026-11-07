"""Bounded local OCR with word evidence, photo recovery and targeted retries."""

import csv
import io
import logging
import os
import re
import subprocess
import time
from pathlib import Path

import cv2
import numpy as np
import pymupdf
import zxingcpp

from platform_core.errors import DomainError
from services.evaluation.rules import (
    LABELS,
    _in_school_section,
    _row_value,
    _visual_rows,
    normalize,
    parse,
    validate,
)
from services.extraction.pdf import open_pdf

log = logging.getLogger(__name__)
ENGINE = "tesseract-5-tur-eng-pipeline-v3"


def _bbox(rect, transform):
    x0, y0, x1, y1 = rect
    corners = np.array([[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]], dtype=np.float32)
    points = cv2.perspectiveTransform(corners, transform)[0]
    return [
        float(points[:, 0].min()),
        float(points[:, 1].min()),
        float(points[:, 0].max()),
        float(points[:, 1].max()),
    ]


def _read(
    image,
    transform,
    number,
    variant,
    deadline,
    *,
    psm=3,
    threshold=0,
    language="tur+eng",
    tessdata_dir=None,
):
    remaining = deadline - time.monotonic()
    if remaining < 0.5:
        return []
    command = [
        "tesseract",
        "stdin",
        "stdout",
        "-l",
        language,
        "--psm",
        str(psm),
        "-c",
        f"thresholding_method={threshold}",
        "-c",
        "tessedit_create_tsv=1",
    ]
    tessdata_dir = tessdata_dir or os.environ.get("OCR_TESSDATA_DIR")
    if tessdata_dir:
        command += ["--tessdata-dir", str(tessdata_dir)]
    try:
        encoded = cv2.imencode(".png", image)[1].tobytes()
        remaining = deadline - time.monotonic()
        if remaining < 0.5:
            return []
        result = subprocess.run(
            command,
            input=encoded,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=min(12, remaining),
            env=os.environ | {"OMP_THREAD_LIMIT": "1"},
            check=True,
        )
    except subprocess.TimeoutExpired:
        return []
    except (OSError, subprocess.CalledProcessError):
        raise DomainError("OCR_UNAVAILABLE", 503) from None
    groups = {}
    for word in csv.DictReader(
        io.StringIO(result.stdout.decode("utf-8")), delimiter="\t", quoting=csv.QUOTE_NONE
    ):
        if word.get("level") != "5" or not word.get("text", "").strip():
            continue
        x, y, w, h = (int(word[key]) for key in ("left", "top", "width", "height"))
        item = {
            "text": word["text"],
            "bbox": _bbox([x, y, x + w, y + h], transform),
            "confidence": max(0, float(word["conf"])) / 100,
        }
        groups.setdefault((word["block_num"], word["par_num"], word["line_num"]), []).append(item)
    blocks = []
    for index, words in enumerate(groups.values()):
        box = [
            min(w["bbox"][0] for w in words),
            min(w["bbox"][1] for w in words),
            max(w["bbox"][2] for w in words),
            max(w["bbox"][3] for w in words),
        ]
        blocks.append(
            {
                "block_id": f"ocr-p{number}-{variant}-l{index}",
                "page": number,
                "bbox": box,
                "text": " ".join(w["text"] for w in words),
                "confidence": sum(w["confidence"] for w in words) / len(words),
                "words": words,
                "variant": variant,
            }
        )
    return blocks


def _artifact(blocks, page):
    return {
        "schema_version": 2,
        "method": "OCR",
        "engine_version": ENGINE,
        "pages": [page],
        "processed_pages": [page["page"]],
        "blocks": blocks,
    }


def _quality(blocks, page, document_type):
    findings = parse(_artifact(blocks, page), document_type)
    reliable = sum(
        any(c["reliable"] for c in candidates)
        for field, candidates in findings["fields"].items()
        if field != "status_text"
    )
    return (
        int(findings["recognized"]),
        reliable,
        sum(b["confidence"] for b in blocks) / max(1, len(blocks)),
    )


def _photo(image):
    """Conservative document crop and illumination correction, retaining its homography."""
    h, w = image.shape[:2]
    homography = np.eye(3, dtype=float)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(cv2.GaussianBlur(gray, (5, 5), 0), 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for contour in sorted(contours, key=cv2.contourArea, reverse=True)[:5]:
        area = cv2.contourArea(contour)
        if not 0.55 * w * h < area < 0.98 * w * h:
            continue
        quad = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
        if len(quad) != 4 or not cv2.isContourConvex(quad):
            continue
        points = quad.reshape(4, 2).astype(np.float32)
        sums, differences = points.sum(axis=1), np.diff(points, axis=1).ravel()
        source = np.array(
            [
                points[sums.argmin()],
                points[differences.argmin()],
                points[sums.argmax()],
                points[differences.argmax()],
            ],
            np.float32,
        )
        if len(np.unique(source, axis=0)) != 4:
            continue
        target = np.array([[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]], np.float32)
        homography = cv2.getPerspectiveTransform(source, target)
        gray = cv2.warpPerspective(gray, homography, (w, h), borderValue=255)
        break
    lines = cv2.HoughLinesP(
        cv2.Canny(gray, 70, 180),
        1,
        np.pi / 1800,
        threshold=70,
        minLineLength=max(40, w // 15),
        maxLineGap=10,
    )
    if lines is not None:
        angles = [np.degrees(np.arctan2(y1 - y0, x1 - x0)) for x0, y0, x1, y1 in lines[:, 0]]
        angles = np.array([a for a in angles if abs(a) < 12])
        if len(angles) >= 5:
            angle = float(np.median(angles))
            if 0.3 < abs(angle) < 12 and np.mean(abs(angles - angle) < 1.2) >= 0.7:
                rotation = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1)
                gray = cv2.warpAffine(gray, rotation, (w, h), borderValue=255)
                homography = np.vstack([rotation, [0, 0, 1]]) @ homography
    kernel = max(21, int(min(h, w) / 35) | 1)
    background = cv2.morphologyEx(
        gray, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel, kernel))
    )
    corrected = cv2.divide(gray, background, scale=255)
    return corrected, homography


def _orient(image, deadline):
    remaining = min(3, deadline - time.monotonic())
    if remaining < 0.5:
        return image, np.eye(3)
    try:
        output = subprocess.run(
            ["tesseract", "stdin", "stdout", "--psm", "0"],
            input=cv2.imencode(".png", image)[1].tobytes(),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=remaining,
            check=True,
            env=os.environ | {"OMP_THREAD_LIMIT": "1"},
        ).stdout.decode("utf-8")
        angle = re.search(r"Rotate:\s*(\d+)", output)
        confidence = re.search(r"Orientation confidence:\s*([\d.]+)", output)
        if not angle or not confidence or float(confidence[1]) < 12:
            return image, np.eye(3)
        h, w = image.shape[:2]
        transforms = {
            90: (cv2.ROTATE_90_CLOCKWISE, [[0, -1, h - 1], [1, 0, 0], [0, 0, 1]]),
            180: (cv2.ROTATE_180, [[-1, 0, w - 1], [0, -1, h - 1], [0, 0, 1]]),
            270: (cv2.ROTATE_90_COUNTERCLOCKWISE, [[0, 1, 0], [-1, 0, w - 1], [0, 0, 1]]),
        }
        if int(angle[1]) in transforms:
            code, matrix = transforms[int(angle[1])]
            return cv2.rotate(image, code), np.array(matrix, dtype=float)
    except (OSError, subprocess.SubprocessError, ValueError):
        pass
    return image, np.eye(3)


def _barcode_blocks(image, transform, number):
    output = []
    for index, code in enumerate(zxingcpp.read_barcodes(image)):
        text = code.text.strip().upper()
        # QR URL contents are not fetched or treated as authoritative identity data.
        if not re.fullmatch(r"(?:YOK[A-Z0-9]{8,37}|MEB[0-9]{12,37}|ADB[0-9]{8,30})", text):
            continue
        points = [
            code.position.top_left,
            code.position.top_right,
            code.position.bottom_left,
            code.position.bottom_right,
        ]
        box = _bbox(
            [
                min(p.x for p in points),
                min(p.y for p in points),
                max(p.x for p in points),
                max(p.y for p in points),
            ],
            transform,
        )
        word = {"text": text, "bbox": box, "confidence": 1.0}
        output.append(
            {
                "block_id": f"ocr-p{number}-barcode-{index}",
                "page": number,
                "bbox": box,
                "text": "Barkod No : " + text,
                "confidence": 1.0,
                "words": [word],
                "variant": "barcode",
            }
        )
    return output


def _barcode_caption(image, transform, number, deadline):
    """Locate vertical barcode bars and OCR their printed caption only."""
    h, w = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, ink = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    vertical = cv2.morphologyEx(
        ink, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(12, h // 80)))
    )
    grouped = cv2.morphologyEx(
        vertical, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (max(8, w // 80), 3))
    )
    contours, _ = cv2.findContours(grouped, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    output = []
    for contour in sorted(contours, key=cv2.contourArea, reverse=True)[:12]:
        x, y, width, height = cv2.boundingRect(contour)
        if not (x > w * 0.45 and y < h * 0.25 and width > w * 0.08 and width > height * 2):
            continue
        # Average vertical bar strokes to suppress JPEG ringing. A decoded
        # Code128 checksum, not OCR substitutions, decides the identifier.
        bars = gray[y + height // 5 : y + height * 4 // 5, max(0, x - 8) : min(w, x + width + 8)]
        if bars.size:
            profile = bars.mean(axis=0)
            decoded = set()
            for threshold in (85, 110, 135, 160, 185, 210):
                stripe = np.tile(np.where(profile < threshold, 0, 255).astype(np.uint8), (80, 1))
                stripe = cv2.copyMakeBorder(stripe, 12, 12, 24, 24, cv2.BORDER_CONSTANT, value=255)
                for code in zxingcpp.read_barcodes(stripe):
                    if re.fullmatch(
                        r"(?:YOK[A-Z0-9]{8,37}|MEB[0-9]{12,37}|ADB[0-9]{8,30})", code.text
                    ):
                        decoded.add(code.text)
            for text in sorted(decoded):
                box = _bbox([x, y, x + width, y + height], transform)
                output.append(
                    {
                        "block_id": f"ocr-p{number}-linear-{len(output)}",
                        "page": number,
                        "bbox": box,
                        "text": "Barkod No : " + text,
                        "confidence": 1.0,
                        "words": [{"text": text, "bbox": box, "confidence": 1.0}],
                        "variant": "barcode",
                    }
                )
            if decoded:
                break
        x0, y0 = max(0, x - 5), y + height
        x1, y1 = min(w, x + width + 5), min(h, y + height + max(20, int(height * 0.65)))
        crop = image[y0:y1, x0:x1]
        matrix = transform @ np.array([[1, 0, x0], [0, 1, y0], [0, 0, 1]], float)
        for block in _read(
            crop, matrix, number, f"caption{len(output)}", deadline, psm=7, language="eng"
        ):
            text = re.sub(r"\s+", "", block["text"])
            if re.fullmatch(r"(?:YOK[A-Z0-9]{8,37}|MEB[0-9]{12,37}|ADB[0-9]{8,30})", text):
                block["text"] = "Barkod No : " + text
                output.append(block)
        if output:
            break
    return output


def _retry_regions(blocks, page, document_type):
    findings = parse(_artifact(blocks, page), document_type)
    missing = {
        field
        for field in findings["expected_fields"]
        if not any(c["reliable"] for c in findings["fields"][field])
    }
    seen = set()
    for row in _visual_rows(_artifact(blocks, page)):
        text = normalize(" ".join(b["text"] for b in row["blocks"]))
        aliases = [a for field in missing for a in LABELS.get(field, ())]
        if "issue_date" in missing:
            aliases += list(LABELS["meb_issue_date"])
        if (
            any(alias in text for alias in aliases)
            or min(b["confidence"] for b in row["blocks"]) < 0.9
        ):
            key = tuple(round(v, 2) for v in row["bbox"])
            if key in seen:
                continue
            seen.add(key)
            yield row["bbox"]


def _value_regions(blocks, page, *, all_values=False, criminal=False):
    """Read values without label punctuation, retaining the observed field context."""
    rows = _visual_rows(_artifact(blocks, page))
    for row in rows:
        aliases = list(LABELS.items())
        if criminal:
            from services.evaluation.criminal import LABELS as criminal_labels

            aliases = list(criminal_labels.items()) + [("identity", LABELS["identity"])]
            aliases.sort(key=lambda item: max(map(len, item[1])), reverse=True)
        if not criminal and _in_school_section(row, rows):
            aliases = [
                ("school_name", ("ADI",)),
                ("province", ("ILI",)),
                ("district", ("ILCESI",)),
            ] + aliases
        words = [word for block in row["blocks"] for word in block.get("words", [])]
        text = " ".join(w["text"] for w in words)
        for field, labels in aliases:
            value = _row_value(row, labels)
            if not value or not words:
                continue
            offset = text.find(value)
            if offset < 0:
                continue
            end, selected = 0, []
            for word in words:
                start, end = end, end + len(word["text"])
                if end > offset:
                    selected.append((word, max(0, offset - start)))
                end += 1
            identity_text = field in {"name", "mother_name", "father_name", "birth_place"}
            if not selected or (
                not all_values
                and not identity_text
                and all(w["confidence"] >= 0.92 for w, _ in selected)
            ):
                break
            first, skip = selected[0]
            box = [
                min(w["bbox"][0] for w, _ in selected),
                min(w["bbox"][1] for w, _ in selected),
                max(w["bbox"][2] for w, _ in selected),
                max(w["bbox"][3] for w, _ in selected),
            ]
            # A colon joined to a number is narrower than the value glyphs.
            if skip and not first["text"][:skip].isalnum():
                box[0] += (first["bbox"][2] - first["bbox"][0]) * skip / (len(first["text"]) * 1.6)
            label = "Okul Adı" if field == "school_name" else labels[0]
            yield box, label, row
            break


def _trim_separator(image):
    """Crop only short leading ink (e.g. a colon), never a full-height glyph."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
    _, ink = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    ys, xs = np.where(ink > 0)
    if not len(xs):
        return image, 0
    _, components, stats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    glyph_heights = [
        s[cv2.CC_STAT_HEIGHT]
        for s in stats[1:]
        if s[cv2.CC_STAT_AREA] >= 8 and s[cv2.CC_STAT_WIDTH] < image.shape[1] * 0.5
    ]
    if not glyph_heights:
        return image, 0
    height = float(np.percentile(glyph_heights, 75))
    columns = np.flatnonzero(np.any(ink, axis=0))
    runs = np.split(columns, np.where(np.diff(columns) > 1)[0] + 1)
    left = 0
    for run in runs:
        if run[0] > min(image.shape[1] * 0.15, height * 2):
            break
        ids = set(np.unique(components[:, run])) - {0}
        component_height = max(stats[i][cv2.CC_STAT_HEIGHT] for i in ids)
        if component_height >= height * 0.65 or len(run) >= height * 0.25:
            break
        left = int(run[-1]) + 1
    return image[:, left:], left


def _paragraph_regions(blocks, page):
    rows = _visual_rows(_artifact(blocks, page))
    for index, row in enumerate(rows):
        text = normalize(" ".join(b["text"] for b in row["blocks"]))
        is_program = text.startswith("PROGRAM")
        if not is_program and ("YUKARIDA" not in text or "OKULUMUZUN" not in text):
            continue
        bottom = row["bbox"][3]
        for following in rows[index + 1 : index + 3]:
            if following.get("variant") != row.get("variant"):
                break
            content = normalize(" ".join(b["text"] for b in following["blocks"]))
            if following["bbox"][1] - bottom > row["height"] * 2 or content.startswith(
                ("BU BELGE", "ILGILI MAKAMA")
            ):
                break
            bottom = following["bbox"][3]
        yield [
            max(0, row["bbox"][0] - row["height"]),
            row["bbox"][1] - row["height"] * 0.25,
            page["width"] * 0.97,
            bottom + row["height"] * 0.25,
        ]


def _criminal_values(image, to_pdf, blocks, metadata, deadline, model_dir, *, student=False):
    """Read complete form values with a multilingual model for proper names."""
    from services.evaluation.criminal import LABELS as criminal_labels

    identity_labels = {
        criminal_labels[f][0]
        for f in ("criminal_name", "parents", "birth_place_date", "registered_location")
    }
    identity_labels.add(LABELS["identity"][0])
    identity_labels.update(criminal_labels[f][0] for f in ("issue_place", "query_purpose"))
    if student:
        identity_labels = {
            LABELS[f][0]
            for f in (
                "name",
                "given_name",
                "surname",
                "mother_name",
                "father_name",
                "birth_place",
                "birth_place_date",
                "birth_date_place",
            )
        }
    scale = 1 / to_pdf[0, 0]
    retries = []
    for index, (box, label, source) in enumerate(
        list(_value_regions(blocks, metadata, all_values=True, criminal=not student))[:24]
    ):
        if deadline - time.monotonic() < 1:
            break
        x0, y0, x1, y1 = box
        margin = max(4, int((y1 - y0) * scale * 0.45)) if student else 4
        x0, y0 = max(0, int(x0 * scale) - 2), max(0, int(y0 * scale) - margin)
        x1, y1 = (
            min(image.shape[1], int(x1 * scale) + 4),
            min(image.shape[0], int(y1 * scale) + margin),
        )
        raw = image[y0:y1, x0:x1]
        if not raw.size:
            continue
        raw, offset = _trim_separator(raw)
        x0 += offset
        language = "Latin" if label in identity_labels and not student else "tur"
        for attempt, factor in enumerate((1, 1.5, 2)):
            crop = cv2.resize(raw, None, fx=factor, fy=factor, interpolation=cv2.INTER_LINEAR)
            if student and attempt == 2:
                gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                crop = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            crop = cv2.copyMakeBorder(
                crop, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=(255, 255, 255)
            )
            matrix = to_pdf @ np.array(
                [[1 / factor, 0, x0 - 20 / factor], [0, 1 / factor, y0 - 20 / factor], [0, 0, 1]]
            )
            variant = f"{'value' if student else 'criminal-value'}{index}-{attempt}"
            retry = _read(
                crop,
                matrix,
                metadata["page"],
                variant,
                deadline,
                psm=13 if student and attempt == 2 else 7,
                language=language,
                tessdata_dir=model_dir,
            )
            if len(retry) != 1:
                continue
            block = retry[0]
            block["text"] = label + " : " + block["text"]
            block["bbox"] = source["bbox"]
            retries.append(block)
            # A second sampling is needed only for uncertain words, not punctuation.
            confidences = [
                w["confidence"] for w in block["words"] if any(c.isalnum() for c in w["text"])
            ]
            if confidences and min(confidences) >= 0.9:
                break
    return retries


def _only_rule_line(ink):
    """Recognize a horizontal +-----+ form divider, never a line of text."""
    ys, xs = np.where(ink)
    if not len(xs):
        return True
    width, height = int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)
    if height < 5 or width < height * 8:
        return False
    xs, ys = xs - xs.min(), ys - ys.min()
    middle = (xs > height) & (xs < width - height)
    if not np.any(middle):
        return False
    center = float(np.median(ys[middle]))
    if np.any(abs(ys[middle] - center) > max(2, height * 0.16)):
        return False
    # A font's '+' crossbar can sit above its '-' glyphs. Verify each end cap
    # about its own center instead of widening the middle ink band.
    for cap in (xs < height, xs > width - height):
        if not np.any(cap) or np.ptp(ys[cap]) < height * 0.7:
            return False
        cap_center = (ys[cap].min() + ys[cap].max()) / 2
        vertical = cap & (abs(ys - cap_center) > max(2, height * 0.16))
        if not np.any(vertical) or np.ptp(xs[vertical]) > max(2, height * 0.2):
            return False
    return True


def _blank_criminal_results(image, to_pdf, blocks, metadata):
    """Prove that a complete form's remaining result area contains no printed ink.

    OCR not finding an archive sentence is insufficient. Reject shadows, noise,
    faint text or any additional result rather than guessing that it is absent.
    """
    findings = parse(_artifact(blocks, metadata), "CRIMINAL_RECORD")
    if findings["layout"] != "CRIMINAL_EDEVLET" or findings["fields"]["archive"]:
        return []
    base = [b for b in blocks if b["variant"] == "base"]
    headings = [
        b for b in base if normalize(b["text"]).startswith("ADLI SICIL KAYDI SORGULAMASI SONUCLARI")
    ]
    notes = [b for b in base if normalize(b["text"]).startswith("NOT: BU SORGULAMA")]
    sentences = [c for c in findings["fields"]["criminal_text"] if c["reliable"]]
    if len(headings) != 1 or len(notes) != 1 or len(sentences) != 1:
        return []
    box = sentences[0]["evidence"]["bbox"]
    if not headings[0]["bbox"][3] < box[1] < box[3] < notes[0]["bbox"][1]:
        return []
    scale = 1 / to_pdf[0, 0]
    top = int(headings[0]["bbox"][3] * scale) + 2
    bottom = int(notes[0]["bbox"][1] * scale) - 2
    area = cv2.cvtColor(image[top:bottom], cv2.COLOR_BGR2GRAY).copy()
    if not area.size or bottom - top < (box[3] - box[1]) * scale * 2:
        return []
    x0, y0, x1, y1 = [int(v * scale) for v in box]
    area[
        max(0, y0 - top - 3) : min(area.shape[0], y1 - top + 4),
        max(0, x0 - 3) : min(area.shape[1], x1 + 4),
    ] = 255
    # A nearly white background is required; do not erase faint archive text.
    ink = area < 245
    if np.count_nonzero(ink) > 2 and not _only_rule_line(ink):
        return []
    return [
        {
            "block_id": f"ocr-p{metadata['page']}-blank-results",
            "page": metadata["page"],
            "bbox": [0.0, top / scale, metadata["width"], bottom / scale],
            "text": "",
            "confidence": 1.0,
            "words": [],
            "variant": "blank-result-section",
        }
    ]


def extract(data, pages, document_type="STUDENT"):
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
            local_models = Path(__file__).resolve().parents[2] / ".ocr-models" / "criminal"
            model_dir = Path(
                os.environ.get(
                    "OCR_CRIMINAL_TESSDATA_DIR",
                    str(local_models if local_models.is_dir() else "/opt/tessdata-criminal"),
                )
            )
            criminal = (
                document_type == "CRIMINAL_RECORD"
                and (model_dir / "tur.traineddata").is_file()
                and (model_dir / "Latin.traineddata").is_file()
            )
            student_models = (
                document_type == "STUDENT"
                and os.environ.get("OCR_STUDENT_EXTENDED", "0") == "1"
                and (model_dir / "tur.traineddata").is_file()
                and (model_dir / "Latin.traineddata").is_file()
            )
            best = _read(
                image,
                to_pdf,
                number,
                "base",
                deadline,
                language="tur" if criminal or student_models else "tur+eng",
                tessdata_dir=model_dir if criminal or student_models else None,
            )
            barcode = _barcode_blocks(image, to_pdf, number)
            if not barcode:
                barcode = _barcode_caption(image, to_pdf, number, deadline)
            quality = _quality(best + barcode, metadata, document_type)
            findings = parse(_artifact(best + barcode, metadata), document_type)
            missing = any(
                not any(c["reliable"] for c in findings["fields"][field])
                for field in findings["expected_fields"]
            )
            attempts = 1
            if criminal and findings["layout"] == "CRIMINAL_EDEVLET":
                best.extend(_criminal_values(image, to_pdf, best, metadata, deadline, model_dir))
                attempts += len({b["variant"] for b in best}) - 1
                if len(doc) == 1:
                    best.extend(_blank_criminal_results(image, to_pdf, best, metadata))
            elif student_models:
                if missing or not findings["recognized"]:
                    candidate = _read(image, to_pdf, number, "fast", deadline)
                    score = _quality(candidate + barcode, metadata, document_type)
                    attempts += 1
                    if score > quality:
                        best, quality = candidate, score
                    ratio = min(1.0, 150 / 72 / scale)
                    reduced = cv2.resize(
                        image, None, fx=ratio, fy=ratio, interpolation=cv2.INTER_AREA
                    )
                    candidate = _read(
                        reduced,
                        to_pdf @ np.diag([1 / ratio, 1 / ratio, 1.0]),
                        number,
                        "reduced",
                        deadline,
                        psm=3,
                        language="tur",
                        tessdata_dir=model_dir,
                    )
                    score = _quality(candidate + barcode, metadata, document_type)
                    attempts += 1
                    if score > quality:
                        best, quality = candidate, score
                    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                    _, clean = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
                    candidate = _read(
                        clean,
                        to_pdf,
                        number,
                        "clean",
                        deadline,
                        psm=6,
                        language="tur",
                        tessdata_dir=model_dir,
                    )
                    score = _quality(candidate + barcode, metadata, document_type)
                    attempts += 1
                    if score > quality:
                        best, quality = candidate, score
                    resize = min(1.0, 2400 / image.shape[0])
                    small = cv2.resize(image, None, fx=resize, fy=resize)
                    matrix = to_pdf @ np.diag([1 / resize, 1 / resize, 1.0])
                    if not findings["recognized"]:
                        small, orientation = _orient(small, deadline)
                        matrix = matrix @ np.linalg.inv(orientation)
                    corrected, transform = _photo(small)
                    for index, (candidate_image, mapping, threshold) in enumerate(
                        ((corrected, matrix @ np.linalg.inv(transform), 0), (small, matrix, 2))
                    ):
                        candidate = _read(
                            candidate_image,
                            mapping,
                            number,
                            f"photo{index}",
                            deadline,
                            psm=6,
                            threshold=threshold,
                            language="tur",
                            tessdata_dir=model_dir,
                        )
                        attempts += 1
                        score = _quality(candidate + barcode, metadata, document_type)
                        if score > quality:
                            best, quality = candidate, score
                best.extend(
                    _criminal_values(
                        image, to_pdf, best, metadata, deadline, model_dir, student=True
                    )
                )
                attempts += len({b["variant"] for b in best}) - 1
            elif missing or not findings["recognized"]:
                resize = min(1.0, 2400 / image.shape[0])
                small = cv2.resize(image, None, fx=resize, fy=resize)
                small_to_pdf = to_pdf @ np.diag([1 / resize, 1 / resize, 1.0])
                if not findings["recognized"]:
                    small, orientation = _orient(small, deadline)
                    small_to_pdf = small_to_pdf @ np.linalg.inv(orientation)
                corrected, transform = _photo(small)
                for index, (candidate_image, matrix, threshold) in enumerate(
                    (
                        (corrected, small_to_pdf @ np.linalg.inv(transform), 0),
                        (small, small_to_pdf, 2),
                    )
                ):
                    candidate = _read(
                        candidate_image,
                        matrix,
                        number,
                        f"photo{index}",
                        deadline,
                        psm=6,
                        threshold=threshold,
                    )
                    attempts += 1
                    score = _quality(candidate + barcode, metadata, document_type)
                    if score > quality and (not findings["recognized"] or quality[1] < 5):
                        best, quality = candidate, score
                values = list(_value_regions(best, metadata))[:20]
                for index, (box, label, source) in enumerate(values):
                    if deadline - time.monotonic() < 1:
                        break
                    x0, y0, x1, y1 = box
                    x0, y0 = max(0, int(x0 * scale) - 2), max(0, int(y0 * scale) - 4)
                    x1, y1 = (
                        min(image.shape[1], int(x1 * scale) + 4),
                        min(image.shape[0], int(y1 * scale) + 5),
                    )
                    crop = image[y0:y1, x0:x1]
                    if not crop.size:
                        continue
                    if label != LABELS["scholarship_boarding"][0] and not source.get(
                        "_value_text", ""
                    ).startswith(("(", "-", "/")):
                        crop, offset = _trim_separator(crop)
                        x0 += offset
                    # White margins keep short values away from the OCR image boundary.
                    crop = cv2.copyMakeBorder(
                        crop, 12, 12, 12, 12, cv2.BORDER_CONSTANT, value=(255, 255, 255)
                    )
                    matrix = to_pdf @ np.array([[1, 0, x0 - 12], [0, 1, y0 - 12], [0, 0, 1]], float)
                    retry = _read(crop, matrix, number, f"value{index}", deadline, psm=7)
                    attempts += 1
                    if label in {
                        LABELS[f][0] for f in ("name", "mother_name", "father_name", "birth_place")
                    }:
                        retry += _read(
                            crop,
                            matrix,
                            number,
                            f"valuetur{index}",
                            deadline,
                            psm=7,
                            language="tur",
                        )
                        attempts += 1
                    if not retry or any(w["confidence"] < 0.90 for b in retry for w in b["words"]):
                        retry += _read(
                            crop,
                            matrix,
                            number,
                            f"valuealt{index}",
                            deadline,
                            psm=13,
                            threshold=2,
                            language="tur",
                        )
                        attempts += 1
                    for block in retry:
                        block["text"] = label + " : " + block["text"]
                        block["bbox"] = source["bbox"]
                    best.extend(retry)
                regions = list(_retry_regions(best, metadata, document_type))[:18]
                for index, box in enumerate(regions):
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
                    retry = _read(crop, matrix, number, f"roi{index}", deadline, psm=7)
                    attempts += 1
                    best.extend(retry)
                for index, box in enumerate(list(_paragraph_regions(best, metadata))[:2]):
                    x0, y0, x1, y1 = [max(0, int(v * scale)) for v in box]
                    crop = image[y0:y1, x0:x1]
                    if not crop.size or deadline - time.monotonic() < 1:
                        break
                    matrix = to_pdf @ np.array([[1, 0, x0], [0, 1, y0], [0, 0, 1]], float)
                    retry = _read(
                        crop,
                        matrix,
                        number,
                        f"paragraph{index}",
                        deadline,
                        psm=6,
                        language="tur",
                        threshold=2,
                    )
                    attempts += 1
                    best.extend(retry)
            blocks.extend(best + barcode)
            dimensions.append(metadata)
            findings = parse(_artifact(best + barcode, metadata), document_type)
            final = validate(findings, document_type, verified=True, ocr_done=True)
            log.info(
                "ocr_page_completed",
                extra={
                    "event": "ocr_page_completed",
                    "duration_ms": round((time.monotonic() - started) * 1000),
                    "ocr_attempts": attempts,
                    "layout": findings["layout"],
                    "missing_fields": sum(c.startswith("UNKNOWN_") for c in final["reason_codes"]),
                    "conflict_fields": sum(
                        c.startswith("CONFLICT_") for c in final["reason_codes"]
                    ),
                },
            )
            if not best and time.monotonic() >= deadline:
                raise DomainError("OCR_TIMEOUT", 422)
    return {
        "schema_version": 2,
        "method": "OCR",
        "engine_version": ENGINE,
        "pages": dimensions,
        "processed_pages": sorted(set(pages)),
        "blocks": blocks,
    }
