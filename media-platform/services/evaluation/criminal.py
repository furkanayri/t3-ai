"""Structured e-Devlet criminal-record forms; no legal or eligibility inference."""

import re

LABELS = {
    "criminal_name": ("AD, SOYAD", "AD SOYAD", "ADI SOYADI", "ADI / SOYADI"),
    "parents": ("ANNE ADI / BABA ADI", "ANA ADI / BABA ADI"),
    "birth_place_date": ("DOGUM YERI / TARIHI", "DOGUM YERI / DOGUM TARIHI"),
    "query_number": ("SAYI",),
    "issue_place": ("YER / TARIH",),
    "query_type": ("SORGU TURU",),
    "query_purpose": ("KULLANIM AMACI",),
    "identity_type": ("KIMLIK TURU",),
    "registered_location": ("NUFUSA KAYITLI OLDUGU YER",),
}
DETAIL_FIELDS = (
    "query_number",
    "query_time",
    "issue_place",
    "query_type",
    "query_purpose",
    "identity_type",
    "registered_location",
    "criminal_text",
    "archive_text",
)
FIELDS = (
    "identity",
    "name",
    "mother_name",
    "father_name",
    "birth_place",
    "birth_date",
    "barcode",
    "issue_date",
    "criminal",
    "archive",
    *DETAIL_FIELDS,
)


def parse_criminal(extraction, fields, rows):
    from services.evaluation.rules import (
        LABELS as COMMON_LABELS,
    )
    from services.evaluation.rules import (
        _add,
        _clean,
        _joined_row,
        _matches_label,
        _parse_date,
        _reliable,
        _row_value,
        normalize,
    )
    from services.ingestion.crypto import valid_tckn

    texts = [normalize(" ".join(b["text"] for b in row["blocks"])) for row in rows]

    def identity_heading(text):
        # OCR may insert a space inside a printed heading. Values are untouched.
        return text.replace(" ", "") == "SORGULAMAYAESASKIMLIKBILGILERI"

    structured = (
        any(identity_heading(t) for t in texts)
        and any(t.startswith("ADLI SICIL KAYDI SORGULAMASI SONUCLARI") for t in texts)
        and any(t == "ADALET BAKANLIGI" for t in texts)
    )
    expected = ["identity", "name", "criminal", "archive"]
    if structured:
        expected += [
            "mother_name",
            "father_name",
            "birth_place",
            "birth_date",
            "barcode",
            "issue_date",
            "query_number",
            "query_time",
            "issue_place",
            "query_type",
            "query_purpose",
            "identity_type",
        ]
    context = {}
    for index, row in enumerate(rows):
        text = " ".join(b["text"] for b in row["blocks"])
        normalized = normalize(text)
        key = (row["page"], row.get("variant", ""))
        state = context.get(key, "header" if structured else "identity")
        if structured and row.get("variant", "").startswith("criminal-value"):
            # A crop inherits only its geometric section, never a field value.
            anchors = [
                (r, t)
                for r, t in zip(rows, texts, strict=True)
                if r["page"] == row["page"] and r.get("variant") == "base"
            ]
            identity_y = [r["bbox"][1] for r, t in anchors if identity_heading(t)]
            result_y = [
                r["bbox"][1]
                for r, t in anchors
                if t.startswith("ADLI SICIL KAYDI SORGULAMASI SONUCLARI")
            ]
            if len(identity_y) == len(result_y) == 1:
                state = (
                    "header"
                    if row["bbox"][1] < identity_y[0]
                    else "identity"
                    if row["bbox"][3] < result_y[0]
                    else "end"
                )
        if identity_heading(normalized) or normalized in {
            "SORGULAMAYA ESAS KIMLIK BILGILERI",
            "KISININ KIMLIK BILGILERI",
            "BELGE SAHIBI",
        }:
            state = "identity"
        if normalized.startswith("ADLI SICIL KAYDI SORGULAMASI SONUCLARI"):
            state = "results"
        if normalized.startswith(("NOT:", "IMZALAYAN", "ONAYLAYAN", "DUZENLEYEN GOREVLI")):
            state = "end"
        context[key] = state

        if state == "header":
            number = _row_value(row, LABELS["query_number"])
            if number:
                match = re.fullmatch(r"([0-9-]+)\s*/\s*([0-2][0-9]:[0-5][0-9])", number)
                if match and int(match[2][:2]) < 24:
                    _add(
                        fields,
                        "query_number",
                        match[1],
                        row | {"_value_text": match[1]},
                        extraction,
                    )
                    _add(
                        fields, "query_time", match[2], row | {"_value_text": match[2]}, extraction
                    )
            place_date = _row_value(row, LABELS["issue_place"])
            if place_date:
                match = re.fullmatch(r"(.+?)\s*/\s*(\d{2}[./-]\d{2}[./-]\d{4})", place_date)
                if match and _parse_date(match[2]):
                    _add(
                        fields,
                        "issue_place",
                        _clean(match[1]),
                        row | {"_value_text": match[1]},
                        extraction,
                    )
                    _add(
                        fields,
                        "issue_date",
                        _parse_date(match[2]),
                        row | {"_value_text": match[2]},
                        extraction,
                    )
            for field in ("query_type", "query_purpose", "identity_type"):
                value = _row_value(row, LABELS[field])
                if value:
                    _add(fields, field, value, row, extraction)

        if state == "identity":
            identity = _row_value(row, COMMON_LABELS["identity"])
            digits = re.sub(r"\s", "", identity or "")
            if re.fullmatch(r"\d{11}", digits) and valid_tckn(digits):
                _add(fields, "identity", digits, row, extraction)
            name = _row_value(row, LABELS["criminal_name"])
            if name and not any(c.isdigit() for c in name):
                # The comma separates given names and surname, not two subjects.
                _add(fields, "name", re.sub(r"\s*,\s*", " ", name), row, extraction)
            parents = _row_value(row, LABELS["parents"])
            if parents and parents.count("/") == 1:
                for field, value in zip(
                    ("mother_name", "father_name"), parents.split("/"), strict=True
                ):
                    value = _clean(value)
                    if value and not any(c.isdigit() for c in value):
                        _add(fields, field, value, row | {"_value_text": value}, extraction)
            birth = _row_value(row, LABELS["birth_place_date"])
            if birth:
                match = re.fullmatch(r"(.+?)\s*/\s*(\d{2}[./-]\d{2}[./-]\d{4})", birth)
                if match:
                    _add(
                        fields,
                        "birth_place",
                        _clean(match[1]),
                        row | {"_value_text": match[1]},
                        extraction,
                    )
                    if _parse_date(match[2]):
                        _add(
                            fields,
                            "birth_date",
                            _parse_date(match[2]),
                            row | {"_value_text": match[2]},
                            extraction,
                        )
            location = _row_value(row, LABELS["registered_location"])
            if _matches_label(text, LABELS["registered_location"]):
                expected.append("registered_location")
            if location:
                _add(fields, "registered_location", location, row, extraction)

        # Only the barcode caption or a locally decoded barcode, never the QR URL.
        if state != "end" and (not structured or state == "header"):
            barcode = _row_value(row, COMMON_LABELS["barcode"]) or text.strip()
            if re.fullmatch(r"ADB[0-9]{8,30}", barcode):
                _add(fields, "barcode", barcode, row, extraction)

        if state not in {"results", "identity"} or (structured and state != "results"):
            continue
        # At most one adjacent continuation; never join across pages/variants.
        options = [(text, row)]
        if index + 1 < len(rows):
            following = rows[index + 1]
            if (following["page"], following.get("variant", "")) == key and 0 <= following["bbox"][
                1
            ] - row["bbox"][3] <= row["height"] * 1.5:
                joined = text + " " + " ".join(b["text"] for b in following["blocks"])
                options.append((joined, _joined_row([row, following], joined)))
        for field, phrase in (
            ("criminal", "ADLI SICIL KAYDI"),
            ("archive", "ADLI SICIL ARSIV KAYDI"),
        ):
            for sentence, source in options:
                normalized_sentence = normalize(sentence)
                prefix = r"YUKARIDA KIMLIK BILGILERI BULUNAN (?:KISININ|SAHSIN) "
                pattern = (
                    (prefix if structured else "(?:" + prefix + ")?")
                    + phrase
                    + r"\s*[:;.-]?\s*(YOKTUR|VARDIR)\.?"
                )
                match = re.fullmatch(pattern, normalized_sentence)
                if match:
                    value_row = source | {"_value_text": sentence}
                    # A decisive token cannot borrow confidence from boilerplate.
                    decisive = [
                        w["confidence"]
                        for b in source["blocks"]
                        for w in b.get("words", [])
                        if normalize(w["text"]).strip(".;:") == match[1]
                    ]
                    reliable = _reliable(value_row, field, sentence) and (
                        all(c >= 0.9 for c in decisive)
                        if decisive
                        else all(
                            b.get("confidence") is None or b["confidence"] >= 0.9
                            for b in source["blocks"]
                        )
                    )
                    _add(
                        fields,
                        field,
                        "NONE" if match[1] == "YOKTUR" else "PRESENT",
                        value_row,
                        extraction,
                        reliable=reliable,
                    )
                    _add(
                        fields,
                        field + "_text",
                        sentence.strip(),
                        value_row,
                        extraction,
                        reliable=reliable,
                    )
                    break

    # OCR absence alone is insufficient; the OCR worker must also have verified
    # every pixel outside the recognized result sentence in the results section.
    optical_blank = extraction["method"] == "OCR" and any(
        b.get("variant") == "blank-result-section"
        and b["text"] == ""
        and b.get("words") == []
        and b["confidence"] == 1.0
        for b in extraction["blocks"]
    )
    complete = (
        structured
        and (extraction["method"] == "PDF_TEXT" or optical_blank)
        and len(extraction["pages"]) == 1
        and "1 / 1" in texts
        and any(t.startswith("NOT: BU SORGULAMA") for t in texts)
        and all(any(c["reliable"] for c in fields[f]) for f in expected if f != "archive")
        and not any("ARSIV" in t for t in texts)
    )
    return (
        structured,
        sorted(set(expected) - ({"archive"} if complete else set())),
        (["archive", "archive_text"] if complete else []),
    )
