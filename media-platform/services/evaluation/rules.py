import re
import unicodedata
from datetime import datetime

from services.evaluation.barcodes import reconcile
from services.evaluation.criminal import DETAIL_FIELDS, parse_criminal
from services.evaluation.criminal import FIELDS as CRIMINAL_FIELDS
from services.evaluation.criminal import LABELS as CRIMINAL_LABELS
from services.evaluation.student_extended import LABELS as EXTENDED_LABELS
from services.evaluation.student_extended import detect, parse_extended
from services.ingestion.crypto import valid_tckn

STUDENT_PROFILE = "student-documents-v5"
CRIMINAL_PROFILE = "criminal-record-v2"
RULES = "rules-v7"
CRIMINAL_RULES = "rules-v6"

STUDENT_FIELDS = (
    "identity",
    "name",
    "mother_name",
    "father_name",
    "birth_date",
    "nationality",
    "university",
    "faculty",
    "department",
    "program",
    "registration_date",
    "education_type",
    "education_duration",
    "student",
    "status_text",
    "class_level",
    "barcode",
    "issue_date",
    "birth_place",
    "school_location",
    "school_name",
    "education_field",
    "education_branch",
    "student_number",
    "scholarship_boarding",
)
IDENTITY_FIELDS = (
    "identity",
    "name",
    "mother_name",
    "father_name",
    "birth_date",
    "nationality",
    "birth_place",
)

LABELS = {
    "identity": (
        "T C KIMLIK NO",
        "T C KIMLIK NUMARASI",
        "TC KIMLIK NO",
        "KIMLIK NO",
        "KIMLIK NUMARASI",
    ),
    "name": (
        "ADI SOYADI",
        "ADI / SOYADI",
        "AD SOYAD",
        "OGRENCININ ADI SOYADI",
    ),
    "mother_name": ("ANNE ADI", "ANA ADI"),
    "father_name": ("BABA ADI",),
    "birth_nationality": ("DOGUM TARIHI / UYRUGU", "DOGUM TARIHI UYRUGU"),
    "registration_date": ("KAYIT TARIHI",),
    "education_duration": (
        "EGITIM TURU / OGRENIM SURESI",
        "OGRENIM TURU / OGRENIM SURESI",
        "EGITIM TURU OGRENIM SURESI",
    ),
    "student": (
        "OGRENCILIK DURUMU",
        "OGRENCI DURUMU",
        "OGRENIM DURUMU",
    ),
    "class_level": ("SINIF", "SINIFI"),
    "program_line": ("PROGRAM",),
    "barcode": ("BARKOD NO", "BARKOD NUMARASI"),
    "issue_date": ("DUZENLENME TARIHI", "BELGE TARIHI"),
    "birth_date": ("DOGUM TARIHI",),
    "birth_place": ("DOGUM YERI",),
    "school_location": ("OKULUN ILI / ILCESI", "OKULUN ILI/ILCESI"),
    "school_name": ("OKUL ADI", "OKULU"),
    "field_branch": ("ALANI / DALI", "ALAN / DAL", "ALANI/DALI"),
    "education_field": ("ALANI",),
    "education_branch": ("DALI",),
    "student_number": ("OGRENCI NUMARASI", "OKUL NUMARASI", "NUMARASI"),
    "meb_issue_date": (
        "OGRENCI BELGESININ ALINDIGI TARIH",
        "BELGENIN ALINDIGI TARIH",
    ),
    "scholarship_boarding": ("BURSLU / YATILI", "BURSLU YATILI"),
}
for _field, _aliases in EXTENDED_LABELS.items():
    LABELS[_field] = tuple(dict.fromkeys((*LABELS.get(_field, ()), *_aliases)))
LABELS.update(CRIMINAL_LABELS)


def rules_for(document_type):
    return RULES if document_type == "STUDENT" else CRIMINAL_RULES


def profile_for(document_type):
    return STUDENT_PROFILE if document_type == "STUDENT" else CRIMINAL_PROFILE


def normalize(text):
    text = str(text or "").translate(str.maketrans("ıİşŞğĞüÜöÖçÇ", "iIsSgGuUoOcC"))
    text = unicodedata.normalize("NFKC", text).upper()
    text = re.sub(r"\s*/\s*", " / ", text)
    return re.sub(r"\s+", " ", text).strip()


def _label_normalize(text):
    return re.sub(r"\s+", " ", normalize(text).replace(".", " ")).strip(" :;.-()")


def _clean(text):
    value = " ".join(str(text or "").replace("\u00a0", " ").split())
    # Detached punctuation is a separator/artifact, not part of a person's name.
    value = re.sub(r"\s+[,;:]+$", "", value)
    return value.strip(" \t:;.").lstrip("=:;!\u201c\u00bb ")


def _usable(text):
    return bool(_clean(text)) and "\ufffd" not in str(text)


def evidence(block, method, *, bbox=None):
    return {
        "block_id": block["block_id"],
        "page": block["page"],
        "bbox": bbox or block["bbox"],
        "method": method,
    }


def _union_bbox(blocks):
    return [
        min(block["bbox"][0] for block in blocks),
        min(block["bbox"][1] for block in blocks),
        max(block["bbox"][2] for block in blocks),
        max(block["bbox"][3] for block in blocks),
    ]


def _visual_rows(extraction):
    """Join fragments that visually occupy the same line, without trusting PDF order."""
    rows = []
    blocks = sorted(
        extraction["blocks"],
        key=lambda block: (
            block.get("variant", ""),
            block["page"],
            block["bbox"][1],
            block["bbox"][0],
            block["block_id"],
        ),
    )
    for block in blocks:
        y0, y1 = block["bbox"][1], block["bbox"][3]
        center = (y0 + y1) / 2
        best = None
        for row in reversed(rows):
            if row.get("variant", "") != block.get("variant", ""):
                continue
            if row["page"] != block["page"]:
                continue
            tolerance = max(3.0, min(y1 - y0, row["height"]) * 0.45)
            if abs(center - row["center"]) <= tolerance:
                best = row
                break
            if center - row["center"] > 25:
                break
        if best is None:
            rows.append(
                {
                    "page": block["page"],
                    "variant": block.get("variant", ""),
                    "center": center,
                    "height": max(1.0, y1 - y0),
                    "blocks": [block],
                }
            )
        else:
            best["blocks"].append(block)
            centers = [(item["bbox"][1] + item["bbox"][3]) / 2 for item in best["blocks"]]
            best["center"] = sum(centers) / len(centers)
            best["height"] = max(item["bbox"][3] - item["bbox"][1] for item in best["blocks"])
    for row in rows:
        row["blocks"].sort(key=lambda block: (block["bbox"][0], block["block_id"]))
        row["bbox"] = _union_bbox(row["blocks"])
    return rows


def _matches_label(text, aliases):
    normalized = _label_normalize(text)
    return any(normalized == alias or normalized.startswith(alias + " ") for alias in aliases)


def _split_inline_label(text, aliases):
    for separator in re.finditer(r"\s*(?::|;|\s\.\s|\s-\s)\s*", str(text)):
        prefix = _label_normalize(str(text)[: separator.start()])
        if any(prefix == alias or prefix.startswith(alias + " (") for alias in aliases):
            return _clean(str(text)[separator.end() :])
    # OCR sometimes loses only the separator. Match a complete label prefix,
    # never a substring from the middle of a prose paragraph.
    for boundary in re.finditer(r"\s+|[:;»]", str(text)):
        if _label_normalize(str(text)[: boundary.start()]) in aliases:
            suffix = str(text)[boundary.end() :].lstrip(" :;.»")
            if suffix and not any(
                _matches_label(text, other) and max(map(len, other)) > max(map(len, aliases))
                for other in LABELS.values()
                if other != aliases
            ):
                return _clean(suffix)
    return None


def _row_value(row, aliases):
    inline_values = []
    label_blocks = set()
    for index, block in enumerate(row["blocks"]):
        value = _split_inline_label(block["text"], aliases)
        if value is not None:
            label_blocks.add(index)
            if value:
                inline_values.append(value)
        elif _matches_label(block["text"], aliases):
            label_blocks.add(index)
    if not label_blocks:
        return None
    first_label = min(label_blocks)
    if any(_clean(block["text"]) for block in row["blocks"][:first_label]):
        return None
    fragments = list(inline_values)
    for index, block in enumerate(row["blocks"]):
        text = _clean(block["text"])
        if index in label_blocks or not text or re.fullmatch(r"[:;.-]+", text):
            continue
        if index < first_label:
            continue
        if any(_matches_label(text, labels) for labels in LABELS.values()):
            continue
        fragments.append(text)
    value = _clean(" ".join(dict.fromkeys(fragments)))
    row["_value_text"] = value
    return value or None


def _row_evidence(row, method):
    return evidence(row["blocks"][0], method, bbox=row["bbox"])


def _reliable(row, field, value):
    # A damaged label does not invalidate a clean value. The value itself must
    # still be usable, preserving the rule that replacement-character values
    # are never trusted.
    if not _usable(value):
        return False
    words = [word for block in row["blocks"] for word in block.get("words", [])]
    if words:
        raw_value = row.get("_value_text") or str(value)
        tokens = set(re.findall(r"[A-Z0-9]+", normalize(raw_value)))
        selected = [
            word["confidence"]
            for word in words
            if set(re.findall(r"[A-Z0-9]+", normalize(word["text"]))) & tokens
        ]
        if selected:
            threshold = 0.9 if field in IDENTITY_FIELDS else 0.78
            return sum(selected) / len(selected) >= threshold and min(selected) >= 0.60
    confidences = [block.get("confidence") for block in row["blocks"]]
    confidences = [confidence for confidence in confidences if confidence is not None]
    # Identity fields require very strong OCR. Stable YÖK labels/value rows can
    # tolerate modest punctuation noise after the line-level mean is computed.
    threshold = 0.9 if field in IDENTITY_FIELDS else 0.78
    return not confidences or min(confidences) >= threshold


def _parse_date(value):
    match = re.search(r"\b(\d{1,2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4})\b", value)
    if not match:
        return None
    try:
        return datetime(int(match[3]), int(match[2]), int(match[1])).date().isoformat()
    except ValueError:
        return None


def _student_status(value):
    normalized = normalize(value)
    if re.fullmatch(r"AKTIF OZEL OGRENCI \(GIDEN\)(?:\s*-\s*.+)?", normalized):
        return "ACTIVE"
    if normalized in {"AKTIF (E-DEVLETTEN KAYIT YAPAN)", "KAYITLI"}:
        return "ACTIVE"
    statuses = {
        "AKTIF": "ACTIVE",
        "AKTIF OGRENCI": "ACTIVE",
        "AKTIF-BEKLEMELI": "ACTIVE",
        "AKTIF - BEKLEMELI": "ACTIVE",
        "PASIF OGRENCILER (KAYIT YENILEMEMIS)": "PASSIVE",
        "PASIF": "PASSIVE",
        "PASIF OGRENCI": "PASSIVE",
        "MEZUN": "OTHER",
        "KAYIT DONDURMUS": "OTHER",
        "KAYDI DONDURULMUS": "OTHER",
        "KAYIT SILINMIS": "OTHER",
    }
    return statuses.get(normalize(value))


def _duration_parts(value):
    match = re.search(r"^(.*?)\s*/\s*(\d{1,2})\s*(?:YIL)?\s*$", value)
    if not match:
        match = re.search(r"^(.*?)\s+(\d{1,2})\s*YIL\s*$", value)
    if not match:
        return None, None
    years = int(match[2])
    kind = _clean(match[1])
    kind = {
        "ORGUN OGRETIM": "ÖRGÜN ÖĞRETİM",
        "IKINCI OGRETIM": "İKİNCİ ÖĞRETİM",
        "UZAKTAN OGRETIM": "UZAKTAN ÖĞRETİM",
        "ACIKOGRETIM": "AÇIKÖĞRETİM",
    }.get(normalize(kind), kind)
    return (kind, years) if 1 <= years <= 20 else (None, None)


def _class_label(value):
    match = re.fullmatch(r"(\d{1,2})\s*[.,]?\s*SINIF", normalize(value))
    return f"{match[1]}. SINIF" if match else value


def _program_parts(value):
    parts = [_clean(part) for part in re.split(r"\s*/\s*", value) if _clean(part)]
    if len(parts) < 3:
        return None
    if len(parts) == 3:
        return {
            "university": parts[0],
            "faculty": parts[1],
            "program": parts[2],
        }
    result = {
        "university": parts[0],
        "faculty": parts[1],
        "department": parts[2],
        "program": " / ".join(parts[3:]),
    }
    if result["program"].count("(") != result["program"].count(")"):
        result.pop("program")
    return result


def _comparison_value(field, value):
    comparable = normalize(value)
    if field in {"class_level", "barcode"}:
        comparable = re.sub(r"[^A-Z0-9]", "", comparable)
    return comparable


class StudentDocumentParser:
    def parse(self, extraction):
        return parse(extraction, "STUDENT")


class CriminalRecordParser:
    def parse(self, extraction):
        return parse(extraction, "CRIMINAL_RECORD")


def _add(fields, field, value, row, extraction, *, reliable=None):
    if value in (None, "") or not _usable(value):
        return
    fields[field].append(
        {
            "value": str(value),
            "evidence": _row_evidence(row, extraction["method"]),
            "reliable": _reliable(row, field, value) if reliable is None else reliable,
        }
    )


def _parse_student(extraction, fields, rows):
    program_row_indices = []
    subject_context = True
    for index, row in enumerate(rows):
        row_text = normalize(" ".join(block["text"] for block in row["blocks"]))
        if any(marker in row_text for marker in ("IMZALAYAN", "ONAYLAYAN", "DUZENLEYEN GOREVLI")):
            subject_context = False
        elif any(
            marker in row_text
            for marker in ("BELGE SAHIBI", "OGRENCI BILGILERI", "KISININ KIMLIK BILGILERI")
        ):
            subject_context = True
        if subject_context:
            identity = _row_value(row, LABELS["identity"])
            identity_digits = re.sub(r"\D", "", identity or "")
            if len(identity_digits) == 11 and valid_tckn(identity_digits):
                _add(fields, "identity", identity_digits, row, extraction)
            for field in ("name", "mother_name", "father_name"):
                value = _row_value(row, LABELS[field])
                if value is not None and not any(character.isdigit() for character in value):
                    _add(fields, field, value, row, extraction)

        for field in ("registration_date", "student", "class_level"):
            value = _row_value(row, LABELS[field])
            if value is None:
                continue
            if field == "registration_date":
                _add(fields, field, _parse_date(value), row, extraction)
            elif field == "student":
                _add(fields, field, _student_status(value), row, extraction)
                status_rows = [row]
                if normalize(value).startswith("AKTIF OZEL OGRENCI (GIDEN)"):
                    for following in rows[index + 1 :]:
                        if (
                            following["page"] != row["page"]
                            or following.get("variant", "") != row.get("variant", "")
                            or following["bbox"][1] - status_rows[-1]["bbox"][3] > 24
                        ):
                            break
                        if any(_row_value(following, a) is not None for a in LABELS.values()):
                            break
                        continuation = _clean(" ".join(b["text"] for b in following["blocks"]))
                        if not re.search(r"FAKÜLTESİ|ÜNİVERSİTESİ|PR[.]|PROGRAM", continuation):
                            break
                        value = _clean(value + " " + continuation)
                        status_rows.append(following)
                _add(fields, "status_text", value, _joined_row(status_rows, value), extraction)
            else:
                _add(fields, field, _class_label(value), row, extraction)

        combined = _row_value(row, LABELS["birth_nationality"])
        if subject_context and combined:
            date = _parse_date(combined)
            if date:
                _add(fields, "birth_date", date, row, extraction)
                nationality = re.sub(r"^.*?\d{4}\s*/?\s*", "", combined).strip()
                _add(fields, "nationality", nationality, row, extraction)

        combined = _row_value(row, LABELS["education_duration"])
        if combined:
            education_type, years = _duration_parts(combined)
            _add(fields, "education_type", education_type, row, extraction)
            _add(fields, "education_duration", years, row, extraction)

        barcode = _row_value(row, LABELS["barcode"])
        if barcode:
            normalized_barcode = normalize(barcode).replace(" ", "")
            if re.fullmatch(r"[A-Z0-9]{8,40}", normalized_barcode):
                _add(fields, "barcode", normalized_barcode, row, extraction)
        issue_date = _row_value(row, LABELS["issue_date"])
        if issue_date:
            _add(fields, "issue_date", _parse_date(issue_date), row, extraction)

        if _row_value(row, LABELS["program_line"]) is not None:
            program_row_indices.append(index)

    for program_row_index in program_row_indices:
        row = rows[program_row_index]
        program_row = row | {"blocks": list(row["blocks"])}
        program_value = _row_value(row, LABELS["program_line"]) or ""
        last_bottom = row["bbox"][3]
        for following in rows[program_row_index + 1 :]:
            if (
                following["page"] != row["page"]
                or following.get("variant", "") != row.get("variant", "")
                or following["bbox"][1] - last_bottom > max(24, row["height"] * 1.6)
            ):
                break
            text = _clean(" ".join(block["text"] for block in following["blocks"]))
            if not text or "ILGILI MAKAMA" in normalize(text):
                break
            if any(_row_value(following, aliases) is not None for aliases in LABELS.values()):
                break
            program_value = _clean(program_value + " " + text)
            program_row["blocks"].extend(following["blocks"])
            last_bottom = following["bbox"][3]
        program_row["bbox"] = _union_bbox(program_row["blocks"])
        parts = _program_parts(program_value)
        if parts:
            for field, value in parts.items():
                _add(fields, field, value, program_row, extraction)

    page_widths = {page["page"]: page["width"] for page in extraction.get("pages", [])}
    for row in rows:
        width = page_widths.get(row["page"], 595)
        if row["page"] != 1 or row["bbox"][0] < width * 0.48 or row["bbox"][1] > 135:
            continue
        for block in row["blocks"]:
            text = _clean(block["text"])
            date = _parse_date(text)
            if date:
                _add(fields, "issue_date", date, row, extraction)
            normalized = normalize(text).replace(" ", "")
            if re.fullmatch(r"[A-Z0-9]{12,40}", normalized) and not normalized.isdigit():
                _add(fields, "barcode", normalized, row, extraction)


def _parse_meb_student(extraction, fields, rows):
    provinces, districts = [], []
    for row in rows:
        school_section = _in_school_section(row, rows)
        preceding = sorted(
            (r for r in rows if r["page"] == row["page"] and r["bbox"][1] <= row["bbox"][1]),
            key=lambda r: r["bbox"][1],
        )
        subject = True
        for candidate in preceding:
            heading = normalize(" ".join(b["text"] for b in candidate["blocks"]))
            if any(
                marker in heading for marker in ("IMZALAYAN", "ONAYLAYAN", "DUZENLEYEN GOREVLI")
            ):
                subject = False
            elif heading in {"OGRENCININ", "BELGE SAHIBI", "OGRENCI BILGILERI"}:
                subject = True
        if not subject:
            continue
        row_text = normalize(" ".join(block["text"] for block in row["blocks"]))
        label_text = _label_normalize(row_text)
        if label_text == "OKULUN":
            school_section = True
            continue
        if label_text == "OGRENCININ":
            school_section = False
            continue

        identity = _row_value(row, LABELS["identity"])
        digits = re.sub(r"\D", "", identity or "")
        if len(digits) == 11 and valid_tckn(digits):
            _add(fields, "identity", digits, row, extraction)
        for field in ("name", "mother_name", "father_name"):
            aliases = LABELS[field]
            if field == "mother_name":
                aliases = aliases + ("ANA ADI",)
            value = _row_value(row, aliases)
            if value is not None and not any(character.isdigit() for character in value):
                _add(fields, field, value, row, extraction)

        birth_date = _row_value(row, LABELS["birth_date"])
        if birth_date:
            _add(fields, "birth_date", _parse_date(birth_date), row, extraction)
        birth_place = _row_value(row, LABELS["birth_place"])
        if birth_place:
            _add(fields, "birth_place", birth_place, row, extraction)

        school_location = _row_value(row, LABELS["school_location"])
        if school_location:
            _add(fields, "school_location", school_location, row, extraction)
        if school_section:
            province_value = _row_value(row, ("ILI",))
            district_value = _row_value(row, ("ILCESI",))
            school_value = _row_value(row, ("ADI",))
            if province_value:
                provinces.append((province_value, dict(row, _value_text=province_value)))
            if district_value:
                districts.append((district_value, dict(row, _value_text=district_value)))
            if school_value:
                _add(fields, "school_name", school_value, row, extraction)
        school_name = _row_value(row, LABELS["school_name"])
        if school_name:
            _add(fields, "school_name", school_name, row, extraction)

        for field in (
            "education_field",
            "education_branch",
            "student_number",
            "scholarship_boarding",
        ):
            value = _row_value(row, LABELS[field])
            if value:
                if field == "scholarship_boarding":
                    value = re.sub(r"\s*/\s*", " / ", value)
                _add(fields, field, value, row, extraction)
        class_level = _row_value(row, ("SINIFI", "SINIF"))
        if class_level:
            _add(fields, "class_level", class_level, row, extraction)

        issue_date = _row_value(row, LABELS["meb_issue_date"])
        if issue_date:
            _add(fields, "issue_date", _parse_date(issue_date), row, extraction)
        barcode = _row_value(row, LABELS["barcode"])
        if barcode and re.fullmatch(r"MEB[0-9]{12,40}", normalize(barcode).replace(" ", "")):
            _add(fields, "barcode", normalize(barcode).replace(" ", ""), row, extraction)

        if "OKUL NUMARASI ILE KAYITLIDIR" in row_text:
            match = re.search(
                r"\bOKULDA\s+(.+?)\s+(\d+)\s+OKUL NUMARASI ILE KAYITLIDIR\b",
                row_text,
            )
            if match:
                class_level = re.sub(r"['’]?NDE$", "", _clean(match[1]), flags=re.IGNORECASE)
                _add(fields, "class_level", class_level, row, extraction)
                _add(fields, "student_number", match[2], row, extraction)
            _add(fields, "student", "ACTIVE", row, extraction)
        elif "ITIBARI ILE KAYITLIDIR" in row_text or "ITIBARIYLE KAYITLIDIR" in row_text:
            _add(fields, "student", "ACTIVE", row, extraction)

    for province, province_row in provinces:
        for district, district_row in districts:
            if province_row["page"] != district_row["page"]:
                continue
            value = province + " / " + district
            _add(
                fields,
                "school_location",
                value,
                _joined_row([province_row, district_row], value),
                extraction,
            )

    # In the second official MEB layout the class and school number live in a
    # prose attestation that may wrap across two visual lines. Parse the joined
    # page text while retaining the nearest row as evidence.
    document_text = normalize(
        " ".join(" ".join(block["text"] for block in row["blocks"]) for row in rows)
    )
    enrollment = re.search(
        r"\bOKULDA\s+(.{1,180}?)\s+(\d{1,10})\s+(?:OKUL\s+)?NUMARASI?\s+ILE\s+KAYITLIDIR\b",
        document_text,
    )
    enrollment_row = next(
        (
            row
            for row in rows
            if "OKULDA" in normalize(" ".join(block["text"] for block in row["blocks"]))
        ),
        None,
    )
    if enrollment and enrollment_row:
        class_level = re.sub(r"['’]?NDE$", "", _clean(enrollment[1]), flags=re.IGNORECASE)
        if not fields["class_level"]:
            _add(fields, "class_level", class_level, enrollment_row, extraction)
        if not fields["student_number"]:
            _add(fields, "student_number", enrollment[2], enrollment_row, extraction)

    # Recognition alone does not prove current enrolment.
    if not fields["student"] and enrollment_row and re.search(r"\bKAYITLIDIR\b", document_text):
        _add(fields, "student", "ACTIVE", enrollment_row, extraction)

    # MEB barcodes and dates occupy the same upper-right region as YÖK ones.
    page_widths = {page["page"]: page["width"] for page in extraction.get("pages", [])}
    for row in rows:
        width = page_widths.get(row["page"], 595)
        if row["page"] != 1 or row["bbox"][0] < width * 0.48 or row["bbox"][1] > 135:
            continue
        for block in row["blocks"]:
            text = _clean(block["text"])
            date = _parse_date(text)
            if date:
                _add(fields, "issue_date", date, row, extraction)
            normalized = normalize(text).replace(" ", "")
            if re.fullmatch(r"MEB[0-9]{12,35}(?:-\d{1,2}){0,2}", normalized):
                _add(fields, "barcode", normalized, row, extraction)


def _joined_row(rows, value=""):
    blocks = [block for row in rows for block in row["blocks"]]
    return {
        "blocks": blocks,
        "bbox": _union_bbox(blocks),
        "page": rows[0]["page"],
        "_value_text": value,
    }


def _in_school_section(row, rows):
    """Use page geometry so a targeted retry retains its original section."""
    headers = [
        (r["bbox"][1], _label_normalize(" ".join(b["text"] for b in r["blocks"])))
        for r in rows
        if r["page"] == row["page"]
    ]
    starts = [y for y, label in headers if label == "OKULUN"]
    ends = [y for y, label in headers if label == "OGRENCININ"]
    return bool(starts and ends and min(starts) < row["bbox"][1] < min(ends))


def _parse_school_details(extraction, fields, rows, layout):
    """School forms have sectioned labels and bounded prose, not YÖK's table."""
    for index, row in enumerate(rows):
        text = _clean(" ".join(b["text"] for b in row["blocks"]))
        normalized = normalize(text)
        school_section = _in_school_section(row, rows)
        aliases = ("ADI", *LABELS["school_name"]) if school_section else LABELS["school_name"]
        school = _row_value(row, aliases)
        if school:
            parts, source_rows = [school], [row]
            context = row
            if row.get("variant", "").startswith(("value", "roi")):
                context = next(
                    (
                        r
                        for r in rows
                        if r["page"] == row["page"]
                        and not r.get("variant", "").startswith(("value", "roi"))
                        and abs(r["center"] - row["center"]) < row["height"] / 2
                    ),
                    row,
                )
            following_rows = [
                r
                for r in rows
                if r["page"] == row["page"]
                and r.get("variant", "") == context.get("variant", "")
                and r["center"] > context["center"]
            ]
            for following in following_rows[:3]:
                following_text = _clean(" ".join(b["text"] for b in following["blocks"]))
                if (
                    following["page"] != row["page"]
                    or following["bbox"][1] - source_rows[-1]["bbox"][3]
                    > max(24, row["height"] * 1.6)
                    or following["bbox"][0] < row["bbox"][0] + row["height"] * 2
                    or any(_matches_label(following_text, a) for a in LABELS.values())
                    or "OGRENCININ" in normalize(following_text)
                ):
                    break
                parts.append(following_text)
                source_rows.append(following)
            # Replace only this row's earlier, truncated candidate.
            fields["school_name"] = [
                c
                for c in fields["school_name"]
                if c["evidence"]["block_id"] != row["blocks"][0]["block_id"]
            ]
            value = " ".join(parts)
            _add(fields, "school_name", value, _joined_row(source_rows, value), extraction)

        combined = _row_value(row, LABELS["field_branch"])
        if combined and "/" in combined:
            field, branch = combined.split("/", 1)
            _add(fields, "education_field", _clean(field), row, extraction)
            _add(fields, "education_branch", _clean(branch), row, extraction)

        if layout == "MEB_SCHOOL_LETTER" and "VALILIGI" in normalized:
            province = re.sub(r"\s+VAL[İI]L[İI][ĞG][İI].*$", "", text, flags=re.I).strip()
            for following in rows[index + 1 : index + 3]:
                header = _clean(" ".join(b["text"] for b in following["blocks"]))
                if following["page"] == row["page"] and "/" in header:
                    district = header.split("/", 1)[0].strip()
                    value = province + " / " + district
                    _add(
                        fields,
                        "school_location",
                        value,
                        _joined_row([row, following], value),
                        extraction,
                    )
                    break

        if (
            "YUKARIDA" not in normalized
            and not normalized.startswith("BU BELGE")
            and not ("ACIK KIMLIGI" in normalized and "OKULUMUZUN" in normalized)
        ):
            continue
        paragraph = [row]
        for following in rows[index + 1 : index + 4]:
            following_text = normalize(" ".join(b["text"] for b in following["blocks"]))
            if (
                following["page"] != row["page"]
                or following.get("variant", "") != row.get("variant", "")
                or following["bbox"][1] - paragraph[-1]["bbox"][3] > max(24, row["height"] * 1.6)
                or following_text.startswith("BU BELGE")
                or any(word in following_text for word in ("IMZA", "MUDURU", "MUHUR"))
            ):
                break
            paragraph.append(following)
        raw = _clean(" ".join(b["text"] for r in paragraph for b in r["blocks"]))
        norm = normalize(raw)
        source = _joined_row(paragraph, raw)
        if normalized.startswith("BU BELGE"):
            if "TARIHINDE VERILMISTIR" in norm:
                _add(fields, "issue_date", _parse_date(raw), source, extraction)
            continue
        if any(
            negative in norm
            for negative in (
                "KAYITLI DEGIL",
                "DEVAM ETMEM",
                "OGRENCISI DEGIL",
                "OGRENCIMIZ DEGIL",
                "DEVAMLI DEGIL",
                "KAYDI SILIN",
                "KAYITLI OLMAD",
                "KAYITLI OLMAYAN",
            )
        ):
            continue
        status_match = re.search(
            r"\b(?:DEVAMLI OGRENCIMIZDIR|DEVAMLI OGRENCISIDIR|KAYITLIDIR)\b", norm
        )
        if status_match:
            status_source = _joined_row(paragraph, status_match[0])
            _add(fields, "student", "ACTIVE", status_source, extraction)
            raw_status = re.search(
                r"(?:halen\s+)?devam[lL][ıiİI]\s+[öÖoO][ğĞgG]renc[iİıI](?:m[iİıI]z|s[iİıI])d[iİıI]r\.?",
                raw,
                re.I,
            ) or re.search(r"kay[ıiİI]tl[ıiİI]d[ıiİI]r\.?", raw, re.I)
            if raw_status:
                _add(
                    fields,
                    "status_text",
                    raw_status[0],
                    _joined_row(paragraph, raw_status[0]),
                    extraction,
                )
        class_match = re.search(
            r"okulumuzun\s+(\d{1,2})\s*[.,]?\s*(?:[oO]\s+)?"
            r"[sS][ıiİI](?:n[ıiİI]?f|mf)(-[İIıi]mam\s+Hatip)?\s*/\s*([A-ZÇĞİÖŞÜ])\b",
            raw,
            re.I,
        )
        if class_match:
            number, modifier, branch = class_match.groups()
            value = f"{number}. Sınıf{modifier or ''} / {branch}"
            value_source = _joined_row(paragraph, " ".join((number, modifier or "", branch)))
            _add(fields, "class_level", value, value_source, extraction)
        enrollment = re.search(
            r"\bOKULUMUZUN\s+(.{1,100}?)\s+SUBESI['’]?NDE\s+(\d{1,10})\s+NUMARA\s+ILE\s+KAYITLI\b",
            norm,
        )
        if enrollment:
            # Capture the same substring from the original text to preserve Turkish letters.
            raw_match = re.search(
                r"okulumuzun\s+(.{1,100}?)\s+[ŞşSs]ubesi['’]?nde\s+(\d{1,10})\s+numara",
                raw,
                re.I,
            )
            class_value = _clean(raw_match[1] if raw_match else enrollment[1])
            if (
                not class_match
                and re.match(r"^\d{1,2}\s*[.]?\s*S[Iİıi]n", class_value)
                and re.search(r"/\s*[A-ZÇĞİÖŞÜ]\s*$", class_value)
            ):
                _add(
                    fields,
                    "class_level",
                    class_value,
                    _joined_row(paragraph, class_value),
                    extraction,
                )
            _add(
                fields,
                "student_number",
                enrollment[2],
                _joined_row(paragraph, enrollment[2]),
                extraction,
            )


def parse(extraction, document_type):
    fields = {field: [] for field in (*STUDENT_FIELDS, *CRIMINAL_FIELDS)}
    safe_texts = [block["text"] for block in extraction["blocks"] if _usable(block["text"])]
    all_text = normalize(" ".join(safe_texts))
    yok_student = "YUKSEKOGRETIM KURULU" in all_text and "OGRENCI BELGESI" in all_text
    # Some MEB PDFs use a font map that corrupts the ministry heading while
    # leaving the form labels and attestation sentence intact. Recognize the
    # official form by several independent structural markers as well.
    meb_markers = sum(
        marker in all_text
        for marker in (
            "DOGUM YERI",
            "OKUL ADI",
            "OGRENCI NUMARASI",
            "OGRENCI BELGESININ ALINDIGI TARIH",
            "OKUL NUMARASI ILE KAYITLIDIR",
        )
    )
    meb_student = "OGRENCI BELGESI" in all_text and (
        "MILLI EGITIM BAKANLIGI" in all_text or meb_markers >= 2
    )
    ek17 = (
        "OGRENCI BELGESI" in all_text
        and all(marker in all_text for marker in ("OKULUN", "OGRENCININ", "OKULUMUZUN"))
        and ("EK-17" in all_text or "DEVAMLI OGRENCIMIZDIR" in all_text)
    )
    meb_student = meb_student or ek17
    document_family = "YOK" if yok_student else "MEB" if meb_student else "UNKNOWN"
    rows = _visual_rows(extraction)
    section_labels = {_label_normalize(" ".join(b["text"] for b in r["blocks"])) for r in rows}
    extended = detect(all_text) if document_type == "STUDENT" else None
    layout = "UNKNOWN"
    if yok_student:
        layout = "YOK_EDEVLET"
    elif ek17:
        layout = "MEB_EK17"
    elif meb_student:
        layout = (
            "MEB_SCHOOL_LETTER"
            if "OKULUMUZUN DEVAMLI" in all_text
            else "MEB_EDEVLET_SECTIONED"
            if {"OKULUN", "OGRENCININ"} <= section_labels
            else "MEB_EDEVLET_STANDARD"
        )
    recognized = (
        (yok_student or meb_student)
        if document_type == "STUDENT"
        else ("ADALET BAKANLIGI" in all_text and "ADLI SICIL" in all_text)
    )
    if extended:
        document_family, layout = extended
        recognized = True
    rows = _visual_rows(extraction)
    if document_type == "STUDENT":
        if document_family == "MEB":
            _parse_meb_student(extraction, fields, rows)
            _parse_school_details(extraction, fields, rows, layout)
        else:
            _parse_student(extraction, fields, rows)
        if extended:
            extended_required = parse_extended(extraction, fields, rows, layout)
    else:
        structured, criminal_required, absent_fields = parse_criminal(extraction, fields, rows)
        if structured:
            layout = "CRIMINAL_EDEVLET"
            document_family = "CRIMINAL_RECORD"
    detected_types = [
        kind
        for kind, title in (("STUDENT", "OGRENCI BELGESI"), ("CRIMINAL_RECORD", "ADLI SICIL"))
        if title in all_text
    ]
    expected_fields = []
    if document_type == "STUDENT" and document_family == "YOK":
        expected_fields = [
            field
            for field in STUDENT_FIELDS
            if field
            not in {
                "birth_place",
                "school_location",
                "school_name",
                "education_field",
                "education_branch",
                "student_number",
                "scholarship_boarding",
                # Some official YÖK documents expose only university/faculty/program.
                "department",
                "status_text",
            }
        ]
    elif document_type == "STUDENT" and document_family == "MEB":
        expected_fields = [
            "identity",
            "name",
            "mother_name",
            "father_name",
            "birth_place",
            "birth_date",
            "school_location",
            "school_name",
            "student_number",
            "student",
            "class_level",
            "barcode",
            "issue_date",
        ]
        if layout in {"MEB_EK17", "MEB_SCHOOL_LETTER"}:
            expected_fields.remove("barcode")
    if document_type == "CRIMINAL_RECORD":
        expected_fields = criminal_required
    elif extended:
        expected_fields = extended_required
    for field in STUDENT_FIELDS if document_type == "STUDENT" else ():
        if field in LABELS and any(_row_value(row, LABELS[field]) is not None for row in rows):
            if field not in expected_fields:
                expected_fields.append(field)
    return {
        "recognized": recognized,
        "document_family": document_family,
        "layout": layout,
        "expected_fields": expected_fields,
        "absent_fields": absent_fields if document_type == "CRIMINAL_RECORD" else [],
        "detected_types": detected_types,
        "barcodes": sorted(
            {candidate["value"] for candidate in fields["barcode"] if candidate["reliable"]}
        ),
        "profile_version": profile_for(document_type),
        "fields": fields,
        "pages": extraction["processed_pages"],
        "recovered": extraction["engine_version"].endswith("-recovered"),
    }


class StudentDocumentValidator:
    def validate(self, findings, *, previous=None, verified=False, ocr_done=False):
        return validate(findings, "STUDENT", previous, verified, ocr_done)


class CriminalRecordValidator:
    def validate(self, findings, *, previous=None, verified=False, ocr_done=False):
        return validate(findings, "CRIMINAL_RECORD", previous, verified, ocr_done)


def validate(findings, document_type, previous=None, verified=False, ocr_done=False):
    reasons, values, proof = [], {}, []
    multiple_barcodes = False
    if findings.get("recovered") or (previous or {}).get("recovered"):
        reasons.append("PDF_RECOVERED")
    required = sorted(
        set(findings.get("expected_fields", [])) | set((previous or {}).get("expected_fields", []))
    )
    absent = set(findings.get("absent_fields", [])) | set((previous or {}).get("absent_fields", []))
    absent = {
        field
        for field in absent
        if not findings["fields"].get(field) and not (previous or {}).get("fields", {}).get(field)
    }
    required = [field for field in required if field not in absent]
    evaluated = list(STUDENT_FIELDS) if document_type == "STUDENT" else list(CRIMINAL_FIELDS)
    candidates_by_field = {}
    for field in evaluated:
        candidates = list(findings["fields"].get(field, []))
        if previous:
            candidates += previous["fields"].get(field, [])
        if field == "barcode":
            candidates, multiple_barcodes = reconcile(candidates)
        candidates_by_field[field] = candidates
        reliable = [candidate for candidate in candidates if candidate["reliable"]]
        distinct = {_comparison_value(field, candidate["value"]) for candidate in reliable}
        if len(distinct) > 1:
            reasons.append("CONFLICT_" + field.upper())
            values[field] = "UNKNOWN"
        elif reliable:
            # Equivalent OCR spellings may differ only in Turkish diacritics.
            # Prefer an actually observed accented spelling; never synthesize it.
            values[field] = max(
                reliable, key=lambda c: sum(ch in "çÇğĞıİöÖşŞüÜ" for ch in c["value"])
            )["value"]
        else:
            values[field] = "UNKNOWN"
        proof += [candidate["evidence"] | {"field": field} for candidate in candidates]
        if values[field] == "UNKNOWN" and field in required:
            reasons.append("UNKNOWN_" + field.upper())

    detected = set(findings.get("detected_types", [])) | set(
        (previous or {}).get("detected_types", [])
    )
    if detected and document_type not in detected:
        reasons.append("DOCUMENT_TYPE_MISMATCH")
    if len(detected) > 1 or multiple_barcodes:
        reasons.append("MULTIPLE_DOCUMENTS")
    if "CONFLICT_IDENTITY" in reasons:
        reasons.append("SUBJECT_AMBIGUOUS")
    recognized = findings["recognized"] or bool(previous and previous["recognized"])
    families = {
        family
        for family in (
            findings.get("document_family"),
            (previous or {}).get("document_family"),
        )
        if family and family != "UNKNOWN"
    }
    document_family = next(iter(families)) if len(families) == 1 else "UNKNOWN"
    if len(families) > 1:
        reasons.append("MULTIPLE_DOCUMENTS")
    if not recognized:
        reasons.append("UNSUPPORTED_LAYOUT")
    if not verified:
        reasons.append("PROFILE_NOT_VERIFIED")
    if {
        "DOCUMENT_TYPE_MISMATCH",
        "MULTIPLE_DOCUMENTS",
        "SUBJECT_AMBIGUOUS",
        "UNSUPPORTED_LAYOUT",
        "PROFILE_NOT_VERIFIED",
    }.intersection(reasons):
        for field in ("student", "criminal", "archive"):
            if field in values:
                values[field] = "UNKNOWN"
    if values.get("criminal") == "PRESENT" or values.get("archive") == "PRESENT":
        reasons.append("RECORD_PRESENT")
    if "MULTIPLE_DOCUMENTS" in reasons or "SUBJECT_AMBIGUOUS" in reasons:
        values["identity"] = values["name"] = "UNKNOWN"

    identity = {
        "tckn": "" if values["identity"] == "UNKNOWN" else values["identity"],
        "full_name": "" if values["name"] == "UNKNOWN" else values["name"],
        "mother_name": ""
        if values.get("mother_name") in (None, "UNKNOWN")
        else values["mother_name"],
        "father_name": ""
        if values.get("father_name") in (None, "UNKNOWN")
        else values["father_name"],
        "birth_date": "" if values.get("birth_date") in (None, "UNKNOWN") else values["birth_date"],
        "nationality": ""
        if values.get("nationality") in (None, "UNKNOWN")
        else values["nationality"],
        "birth_place": ""
        if values.get("birth_place") in (None, "UNKNOWN")
        else values["birth_place"],
        "tckn_status": "READABLE" if values["identity"] != "UNKNOWN" else "UNKNOWN",
        "name_status": "READABLE" if values["name"] != "UNKNOWN" else "UNKNOWN",
        "mother_name_status": "READABLE"
        if values.get("mother_name") not in (None, "UNKNOWN")
        else "UNKNOWN",
        "father_name_status": "READABLE"
        if values.get("father_name") not in (None, "UNKNOWN")
        else "UNKNOWN",
        "birth_date_status": "READABLE"
        if values.get("birth_date") not in (None, "UNKNOWN")
        else "UNKNOWN",
        "nationality_status": "READABLE"
        if values.get("nationality") not in (None, "UNKNOWN")
        else "UNKNOWN",
        "birth_place_status": "READABLE"
        if values.get("birth_place") not in (None, "UNKNOWN")
        else "UNKNOWN",
        "candidates": [
            {"field": field, **candidate}
            for field in IDENTITY_FIELDS
            for candidate in candidates_by_field.get(field, [])
        ][:120],
    }
    document_metadata = {
        "barcode": "" if values.get("barcode") in (None, "UNKNOWN") else values["barcode"],
        "issue_date": "" if values.get("issue_date") in (None, "UNKNOWN") else values["issue_date"],
        "layout": findings.get("layout", "UNKNOWN")
        if findings.get("recognized")
        else (previous or {}).get("layout", "UNKNOWN"),
        "source_format": "PDF",
    }
    student = {
        "university": "" if values.get("university") in (None, "UNKNOWN") else values["university"],
        "faculty": "" if values.get("faculty") in (None, "UNKNOWN") else values["faculty"],
        "department": "" if values.get("department") in (None, "UNKNOWN") else values["department"],
        "program": "" if values.get("program") in (None, "UNKNOWN") else values["program"],
        "registration_date": ""
        if values.get("registration_date") in (None, "UNKNOWN")
        else values["registration_date"],
        "education_type": ""
        if values.get("education_type") in (None, "UNKNOWN")
        else values["education_type"],
        "education_duration_years": (
            int(values["education_duration"])
            if str(values.get("education_duration", "")).isdigit()
            else None
        ),
        "status": values.get("student", ""),
        "status_text": ""
        if values.get("status_text") in (None, "UNKNOWN")
        else values["status_text"],
        "class_level": ""
        if values.get("class_level") in (None, "UNKNOWN")
        else values["class_level"],
        "school_location": ""
        if values.get("school_location") in (None, "UNKNOWN")
        else values["school_location"],
        "school_name": ""
        if values.get("school_name") in (None, "UNKNOWN")
        else values["school_name"],
        "education_field": ""
        if values.get("education_field") in (None, "UNKNOWN")
        else values["education_field"],
        "education_branch": ""
        if values.get("education_branch") in (None, "UNKNOWN")
        else values["education_branch"],
        "student_number": ""
        if values.get("student_number") in (None, "UNKNOWN")
        else values["student_number"],
        "scholarship_boarding": ""
        if values.get("scholarship_boarding") in (None, "UNKNOWN")
        else values["scholarship_boarding"],
    }
    needs = any(reason.startswith("UNKNOWN_") for reason in reasons) or not recognized
    need_ocr = (
        not ocr_done
        and needs
        and not any(reason.startswith("CONFLICT_") for reason in reasons)
        and not {"DOCUMENT_TYPE_MISMATCH", "MULTIPLE_DOCUMENTS"}.intersection(reasons)
    )
    result = {
        "schema_version": 7 if document_type == "STUDENT" else 6,
        "document_family": document_family if document_type == "STUDENT" else "CRIMINAL_RECORD",
        "student_status": values.get("student", ""),
        "criminal_status": values.get("criminal", ""),
        "archive_status": values.get("archive", ""),
        "identity_status": (
            "READABLE"
            if identity["tckn"] and identity["full_name"]
            else "PARTIAL"
            if identity["tckn"] or identity["full_name"]
            else "UNKNOWN"
        ),
        "identity": identity,
        "document_metadata": document_metadata,
        "student": student,
        "field_states": {
            field: (
                "CONFLICT"
                if "CONFLICT_" + field.upper() in reasons
                else "READABLE"
                if values.get(field) not in (None, "UNKNOWN", "")
                else "NOT_PRESENT"
                if recognized and field not in required and not candidates_by_field.get(field)
                else "UNREADABLE"
            )
            for field in evaluated
        },
        "reason_codes": sorted(set(reasons)),
        "warnings": sorted(set(reasons)),
        "evidence": proof[:80],
        "needs_ocr_pages": sorted(set(findings["pages"])) if need_ocr else [],
    }
    if document_type == "CRIMINAL_RECORD":
        result["criminal_record"] = {
            field: "" if values.get(field) in (None, "UNKNOWN") else values[field]
            for field in DETAIL_FIELDS
        }
        # No archive statement is different from an explicit negative statement.
        for field in ("archive", "archive_text"):
            if field not in absent and not candidates_by_field.get(field):
                result["field_states"][field] = "UNREADABLE"
    else:
        result["document_metadata"]["subtype"] = (
            "GRADUATION" if document_metadata["layout"] == "MEB_GRADUATION" else "ENROLLMENT"
        )
    return result
