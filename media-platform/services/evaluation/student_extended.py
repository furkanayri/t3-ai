"""Institution-issued student letters and MEB graduation/status forms."""

import re

LABELS = {
    "given_name": ("ADI",),
    "surname": ("SOYADI",),
    "birth_place_date": ("DOGUM YERI VE YILI", "DOGUM YERI / TARIHI"),
    "birth_date_place": ("DOGUM TARIHI / DOGUM YERI",),
    "identity": ("YABANCI KIMLIK NO", "T C KIMLIK NO*", "T C KIMLIK NO", "KIMLIK NO"),
    "faculty": (
        "FAKULTE / YUKSEKOKUL / ENSTITU",
        "FAKULTE/YO/ENSTITU",
        "FAKULTE/YUKSEKOKUL",
        "AKADEMIK BIRIM",
        "ENSTITU",
    ),
    "program": ("BOLUM / PROGRAM", "DIPLOMA PROGRAMI", "ANABILIM DALI"),
    "department": ("BOLUM",),
    "student_number": ("OGRENCI NO", "NUMARASI", "OGRENCI NUMARASI"),
    "registration_date": ("UNIVERSITEYE KAYIT TARIHI", "KAYIT TARIHI"),
    "nationality": ("UYRUK", "UYRUGU"),
    "education_type": ("OGRENIM TURU",),
    "scholarship_boarding": ("BURS DURUMU",),
    "student": ("KAYIT DURUMU", "OGRENIM DURUMU"),
    "school_name": ("MEZUN OLDUGU OKUL",),
    "field_branch": ("MEZUN OLDUGU ALANI / DALI", "ALAN/BOLUM"),
    "education_duration": ("OGRENIM SURESI",),
}


def detect(text):
    if "MEZUNIYET BELGESI" in text and "MEZUN OLDUGU OKUL" in text:
        return "MEB", "MEB_GRADUATION"
    if "OGRENCI DURUM BELGESI" in text and "OKUL ADI" in text:
        return "MEB", "MEB_OPEN_EDUCATION"
    institution_form = (
        sum(
            t in text
            for t in (
                "FAKULTE / YUKSEKOKUL / ENSTITU",
                "DERS KAYIT DURUMU",
                "OGRETIM YILI / DONEMI",
                "BOLUM / PROGRAM",
            )
        )
        >= 3
    )
    if (
        (
            "UNIVERSITESI" in text
            or institution_form
            or ("ENSTITU" in text and "ANABILIM DALI" in text and "KAYITLI OGRENCIMIZDIR" in text)
        )
        and "YUKSEKOGRETIM KURULU" not in text
        and ("OGRENCI BELGESI" in text or "KAYITLI OGRENCIMIZDIR" in text)
        and any(t in text for t in ("OGRENCI NO", "AKADEMIK BIRIM", "OGRENIM DURUMU", "KIMLIK NO"))
    ):
        return "UNIVERSITY", "UNIVERSITY_LETTER"
    return None


def parse_extended(extraction, fields, rows, layout):
    from services.evaluation.rules import (
        _add,
        _clean,
        _joined_row,
        _parse_date,
        _row_value,
        _student_status,
        normalize,
    )

    required = {"identity", "name", "birth_date", "student", "issue_date"}
    if layout == "UNIVERSITY_LETTER":
        required |= {"university", "student_number"}
    else:
        required |= {"school_name", "barcode"}
    names = {}
    subject_context = True
    for index, row in enumerate(rows):
        text = _clean(" ".join(b["text"] for b in row["blocks"]))
        norm = normalize(text)
        if any(t in norm for t in ("IMZALAYAN", "ONAYLAYAN", "DUZENLEYEN GOREVLI")):
            subject_context = False
        elif norm in {"OGRENCI BILGILERI", "BELGE SAHIBI", "KISININ KIMLIK BILGILERI"}:
            subject_context = True
        page_height = next(p["height"] for p in extraction["pages"] if p["page"] == row["page"])
        # Explicit institution heading only; do not use addresses/signatory prose.
        if layout == "UNIVERSITY_LETTER" and row["bbox"][1] < page_height * 0.25:
            m = re.fullmatch(
                r"(?:T[.]?\s*C[.]?\s*)?(.+?\bÜNİVERSİTESİ)(?:\s+REKTÖRLÜĞÜ)?", text, re.I
            )
            if m:
                _add(fields, "university", m[1], row, extraction)
        if row["bbox"][1] > page_height * 0.83:
            # Only explicitly labelled issue dates may be taken from a footer.
            date = _row_value(row, ("DUZENLENME TARIHI",))
            if date:
                _add(fields, "issue_date", _parse_date(date), row, extraction)
            continue
        for field in ("given_name", "surname"):
            value = _row_value(row, LABELS[field])
            if subject_context and value and not any(c.isdigit() for c in value):
                names.setdefault((row["page"], row.get("variant", "")), {})[field] = (value, row)
        for field in (
            "faculty",
            "program",
            "department",
            "student_number",
            "nationality",
            "education_type",
            "scholarship_boarding",
        ):
            value = _row_value(row, LABELS[field])
            if value:
                required.add(field)
                _add(fields, field, value, row, extraction)
        for field, aliases in (
            ("birth_date", ("DOGUM TARIHI",)),
            ("registration_date", LABELS["registration_date"]),
        ):
            value = _row_value(row, aliases)
            if value:
                required.add(field)
                _add(fields, field, _parse_date(value), row, extraction)
        for field in ("birth_place_date", "birth_date_place"):
            value = _row_value(row, LABELS[field])
            if not value:
                continue
            date_pattern = r"\d{1,2}[./-]\d{1,2}[./-]\d{4}"
            match = re.fullmatch(
                rf"(.+?)\s*/\s*({date_pattern})"
                if field == "birth_place_date"
                else rf"({date_pattern})\s*/\s*(.+)",
                value,
            )
            if match:
                place, date = (
                    (match[1], match[2]) if field == "birth_place_date" else (match[2], match[1])
                )
                _add(fields, "birth_place", _clean(place), row | {"_value_text": place}, extraction)
                _add(
                    fields, "birth_date", _parse_date(date), row | {"_value_text": date}, extraction
                )
                required.add("birth_place")
        duration = _row_value(row, LABELS["education_duration"])
        if duration and re.fullmatch(r"\d{1,2}(?:\s*[Yy][ıiİI][Ll])?", duration):
            _add(fields, "education_duration", re.search(r"\d+", duration)[0], row, extraction)
        combined = _row_value(row, LABELS["field_branch"])
        if combined:
            parts = re.split(r"\s*/\s*", combined, maxsplit=1)
            # Some MEB PDF text maps omit the slash between 'ALANI YOK/DAL YOK'.
            if len(parts) == 1 and normalize(combined) == "ALANI YOKDAL YOK":
                parts = ["ALANI YOK", "DAL YOK"]
            _add(fields, "education_field", parts[0], row, extraction)
            if len(parts) == 2:
                _add(fields, "education_branch", parts[1], row, extraction)
        status = _row_value(row, LABELS["student"] + ("OGRENCILIK DURUMU",))
        if status:
            _add(fields, "status_text", status, row, extraction)
            _add(fields, "student", _student_status(status), row, extraction)
        if layout == "MEB_GRADUATION" and "MEZUN OLMUSTUR" in norm:
            _add(fields, "student", "OTHER", row, extraction)
            _add(fields, "status_text", "Mezun", row, extraction)
        if layout == "UNIVERSITY_LETTER" and any(
            s in norm
            for s in (
                "KAYITLI OGRENCIMIZDIR",
                "UNIVERSITEMIZ OGRENCISIDIR",
                "UNIVERSITESI OGRENCISIDIR",
                "PROGRAMI OGRENCILERINDENDIR",
            )
        ):
            if not re.search(r"\b(DEGIL|DEGILDIR|AYRILMIS|SILINMIS)\b", norm):
                _add(fields, "student", "ACTIVE", row, extraction)
                _add(fields, "status_text", text, row, extraction)
        if row["bbox"][1] < page_height * 0.25:
            date = _row_value(row, ("TARIH", "BELGE TARIH VE SAYISI", "EVRAK TARIH VE SAYISI"))
            if not date and re.fullmatch(r"\d{1,2}[./-]\d{1,2}[./-]\d{4}(?:\s+\d{2}:\d{2})?", text):
                date = text
            if date:
                _add(fields, "issue_date", _parse_date(date), row, extraction)
    for pair in names.values():
        if pair.keys() >= {"given_name", "surname"}:
            first, last = pair["given_name"], pair["surname"]
            if abs(first[1]["bbox"][1] - last[1]["bbox"][1]) < 60:
                value = first[0] + " " + last[0]
                _add(fields, "name", value, _joined_row([first[1], last[1]], value), extraction)
    return sorted(required)
