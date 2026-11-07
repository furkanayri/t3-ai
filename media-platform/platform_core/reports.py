"""Report exports; full identity is limited to the permission-gated batch export."""

import csv
import io
from html import escape

import pymupdf
from platform_core import timeshim as timezone
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

LABELS = {
    "NOT_PRESENT": "Belgede yok",
    "UNREADABLE": "Okunamadı",
    "CONFLICT": "Çelişkili",
    "ACTIVE": "Aktif",
    "PASSIVE": "Pasif",
    "OTHER": "Diğer",
    "UNKNOWN": "Belirsiz",
    "NONE": "Kayıt yok",
    "PRESENT": "Kayıt var",
    "READABLE": "Okunabildi",
    "PARTIAL": "Kısmen okunabildi",
    "STUDENT": "Öğrenci belgesi",
    "CRIMINAL_RECORD": "Adli sicil belgesi",
    "PENDING": "Bekliyor",
    "PROCESSING": "İşleniyor",
    "FETCHING": "İndiriliyor",
    "COMPLETED": "Tamamlandı",
    "FAILED": "Başarısız",
    "CANCELLED": "İptal",
    "YOK": "YÖK",
    "MEB": "MEB",
    "UNIVERSITY": "Üniversite",
}


def student_status_label(result):
    if (
        result.get("student_status") == "OTHER"
        and result.get("document_metadata", {}).get("subtype") == "GRADUATION"
    ):
        return "Mezun"
    return LABELS.get(result.get("student_status"), "")


REPORT_HEADERS = [
    "Belge referansı",
    "Analiz referansı",
    "Tür",
    "Belge ailesi",
    "İşlem durumu",
    "Ad soyad",
    "Maskeli TCKN",
    "Anne adı",
    "Baba adı",
    "Doğum tarihi",
    "Uyruk",
    "Doğum yeri",
    "Barkod",
    "Düzenlenme tarihi",
    "Üniversite",
    "Fakülte",
    "Bölüm",
    "Program",
    "Kayıt tarihi",
    "Eğitim türü",
    "Öğrenim süresi (yıl)",
    "Sınıf",
    "Okulun ili/ilçesi",
    "Okul adı",
    "Alan",
    "Dal",
    "Öğrenci numarası",
    "Burslu / yatılı",
    "Doğrulanmış öğrencilik durumu",
    "Belgedeki öğrencilik durumu",
    "Sicil",
    "Arşiv",
    "Uyarılar",
    "Hata kodu",
    "Belge düzeni",
    "Kaynak formatı",
    "Alan durumları",
    "Sorgu numarası",
    "Sorgu saati",
    "Düzenlenme yeri",
    "Sorgu türü",
    "Kullanım amacı",
    "Kimlik türü",
    "Nüfusa kayıtlı olduğu yer",
    "Sicil sonucu (belgedeki ifade)",
    "Arşiv sonucu (belgedeki ifade)",
]

FIELD_LABELS = {
    "identity": "Maskeli TCKN",
    "name": "Ad soyad",
    "mother_name": "Anne adı",
    "father_name": "Baba adı",
    "birth_date": "Doğum tarihi",
    "nationality": "Uyruk",
    "birth_place": "Doğum yeri",
    "barcode": "Barkod",
    "issue_date": "Düzenlenme tarihi",
    "university": "Üniversite",
    "faculty": "Fakülte",
    "department": "Bölüm",
    "program": "Program",
    "registration_date": "Kayıt tarihi",
    "education_type": "Eğitim türü",
    "education_duration": "Öğrenim süresi (yıl)",
    "class_level": "Sınıf",
    "school_location": "Okulun ili/ilçesi",
    "school_name": "Okul adı",
    "education_field": "Alan",
    "education_branch": "Dal",
    "student_number": "Öğrenci numarası",
    "scholarship_boarding": "Burslu / yatılı",
    "student": "Doğrulanmış öğrencilik durumu",
    "status_text": "Belgedeki öğrencilik durumu",
    "criminal": "Sicil",
    "archive": "Arşiv",
    "query_number": "Sorgu numarası",
    "query_time": "Sorgu saati",
    "issue_place": "Düzenlenme yeri",
    "query_type": "Sorgu türü",
    "query_purpose": "Kullanım amacı",
    "identity_type": "Kimlik türü",
    "registered_location": "Nüfusa kayıtlı olduğu yer",
    "criminal_text": "Sicil sonucu (belgedeki ifade)",
    "archive_text": "Arşiv sonucu (belgedeki ifade)",
}

BATCH_REPORT_HEADERS = {
    "STUDENT": [
        "Tür",
        "Belge ailesi",
        "İşlem durumu",
        "Ad soyad",
        "Maskeli TCKN",
        "Anne adı",
        "Baba adı",
        "Doğum tarihi",
        "Uyruk",
        "Doğum yeri",
        "Barkod",
        "Düzenlenme tarihi",
        "Üniversite",
        "Fakülte",
        "Bölüm",
        "Program",
        "Kayıt tarihi",
        "Eğitim türü",
        "Öğrenim süresi (yıl)",
        "Sınıf",
        "Okulun ili/ilçesi",
        "Okul adı",
        "Alan",
        "Dal",
        "Öğrenci numarası",
        "Burslu / yatılı",
        "Doğrulanmış öğrencilik durumu",
        "Belgedeki öğrencilik durumu",
        "Uyarılar",
        "Hata kodu",
        "Kaynak formatı",
    ],
    "CRIMINAL_RECORD": [
        "Tür",
        "Belge ailesi",
        "İşlem durumu",
        "Ad soyad",
        "Maskeli TCKN",
        "Anne adı",
        "Baba adı",
        "Doğum tarihi",
        "Doğum yeri",
        "Barkod",
        "Düzenlenme tarihi",
        "Sicil",
        "Arşiv",
        "Sorgu numarası",
        "Sorgu saati",
        "Düzenlenme yeri",
        "Sorgu türü",
        "Kullanım amacı",
        "Kimlik türü",
        "Sicil sonucu (belgedeki ifade)",
        "Arşiv sonucu (belgedeki ifade)",
        "Uyarılar",
        "Hata kodu",
        "Kaynak formatı",
    ],
}

BATCH_SHEET_TITLES = {
    "STUDENT": "Öğrenci belgeleri",
    "CRIMINAL_RECORD": "Adli sicil belgeleri",
}


def field_state_summary(result):
    return "; ".join(
        f"{FIELD_LABELS.get(key, key)}: {LABELS[state]}"
        for key, state in result.get("field_states", {}).items()
        if state != "READABLE"
    )


def csv_cell(value):
    value = str(value or "")
    return (
        "'" + value
        if value.lstrip().startswith(("=", "+", "-", "@")) or value.startswith(("\t", "\r", "\n"))
        else value
    )


def report_values(
    document,
    result,
    *,
    document_type="",
    processing_status="",
    error_code="",
):
    result = result or {}
    identity = result.get("identity", {})
    metadata = result.get("document_metadata", {})
    student = result.get("student", {})
    if document is not None:
        document_type = document.document_type
        processing_status = document.processing_status
        error_code = error_code or document.error_code
    if processing_status == "FAILED" and not error_code:
        error_code = "WORKER_FAILED"
    values = [
        document.id if document is not None else "",
        result.get("job_id"),
        LABELS.get(document_type, document_type),
        LABELS.get(result.get("document_family"), result.get("document_family")),
        LABELS.get(processing_status, processing_status),
        identity.get("full_name"),
        identity.get("tckn_mask"),
        identity.get("mother_name"),
        identity.get("father_name"),
        identity.get("birth_date"),
        identity.get("nationality"),
        identity.get("birth_place"),
        metadata.get("barcode"),
        metadata.get("issue_date"),
        student.get("university"),
        student.get("faculty"),
        student.get("department"),
        student.get("program"),
        student.get("registration_date"),
        student.get("education_type"),
        student.get("education_duration_years"),
        student.get("class_level"),
        student.get("school_location"),
        student.get("school_name"),
        student.get("education_field"),
        student.get("education_branch"),
        student.get("student_number"),
        student.get("scholarship_boarding"),
        student_status_label(result),
        student.get("status_text"),
        LABELS.get(result.get("criminal_status"), ""),
        LABELS.get(result.get("archive_status"), ""),
        "; ".join(result.get("warnings", [])),
        error_code,
        metadata.get("layout"),
        metadata.get("source_format"),
        field_state_summary(result),
    ]
    by_label = {label: key for key, label in FIELD_LABELS.items()}
    details = result.get("criminal_record", {})
    values += [details.get(by_label[header]) for header in REPORT_HEADERS[-9:]]
    for index, header in enumerate(REPORT_HEADERS):
        state = result.get("field_states", {}).get(by_label.get(header))
        if values[index] in (None, "", "Belirsiz") and state in LABELS:
            values[index] = LABELS[state]
    return values


def csv_report(rows):
    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(REPORT_HEADERS)
    for document, result in rows:
        writer.writerow([csv_cell(value) for value in report_values(document, result)])
    return output.getvalue()


def _batch_sheet(workbook, document_type, rows):
    sheet = workbook.create_sheet(BATCH_SHEET_TITLES[document_type])
    sheet.sheet_view.showGridLines = False
    sheet.freeze_panes = "A2"
    source_headers = BATCH_REPORT_HEADERS[document_type]
    batch_headers = ["TCKN" if header == "Maskeli TCKN" else header for header in source_headers]
    headers = ["Sıra", "Belge bağlantısı", *batch_headers]
    sheet.append(headers)
    for cell in sheet[1]:
        cell.font = Font(color="FFFFFF", bold=True)
        cell.fill = PatternFill("solid", fgColor="18294F")
        cell.alignment = Alignment(vertical="center")
    sheet.row_dimensions[1].height = 24

    for batch_row, result, source_url, full_tckn in rows:
        document = batch_row.document
        status = (
            document.processing_status
            if document is not None
            else ("FAILED" if batch_row.error_code else "WAITING")
        )
        values = dict(
            zip(
                REPORT_HEADERS,
                report_values(
                    document,
                    result,
                    document_type=batch_row.document_type,
                    processing_status=status,
                    error_code=batch_row.error_code,
                ),
                strict=True,
            )
        )
        values["Maskeli TCKN"] = full_tckn
        sheet.append(
            [
                batch_row.number,
                csv_cell(source_url),
                *[csv_cell(values[header]) for header in source_headers],
            ]
        )

    sheet.auto_filter.ref = sheet.dimensions
    for index, column in enumerate(sheet.columns, 1):
        width = min(max(len(str(cell.value or "")) for cell in column) + 2, 42)
        sheet.column_dimensions[get_column_letter(index)].width = max(width, 10)


def batch_xlsx_report(rows):
    rows = list(rows)
    workbook = Workbook()
    workbook.remove(workbook.active)
    for document_type in ("STUDENT", "CRIMINAL_RECORD"):
        typed_rows = [row for row in rows if row[0].document_type == document_type]
        if typed_rows:
            _batch_sheet(workbook, document_type, typed_rows)
    if not workbook.worksheets:
        workbook.create_sheet("Belge sonuçları")
    target = io.BytesIO()
    workbook.save(target)
    workbook.close()
    return target.getvalue()


def pdf_report(document, result):
    identity = result["identity"]
    metadata = result.get("document_metadata", {})
    student = result.get("student", {})
    pairs = [
        ("Belge referansı", str(document.id)),
        ("Analiz referansı", result["job_id"]),
        ("Tür", LABELS[document.document_type]),
        ("Belge ailesi", LABELS.get(result.get("document_family"), "Belirsiz")),
        ("Kural / profil", result["rule_version"] + " / " + result["profile_version"]),
        (
            "Analiz zamanı",
            timezone.localtime(timezone.datetime.fromisoformat(result["created_at"])).strftime(
                "%d.%m.%Y %H:%M:%S Türkiye"
            ),
        ),
        ("Ad soyad", identity["full_name"] or "Belirsiz"),
        ("TCKN (maskeli)", identity["tckn_mask"] or "Belirsiz"),
        ("Anne adı", identity.get("mother_name") or "Belirsiz"),
        ("Baba adı", identity.get("father_name") or "Belirsiz"),
        ("Doğum tarihi", identity.get("birth_date") or "Belirsiz"),
        ("Barkod", metadata.get("barcode") or "Belirsiz"),
        ("Düzenlenme tarihi", metadata.get("issue_date") or "Belirsiz"),
    ]
    if result.get("document_family") == "CRIMINAL_RECORD":
        pairs.append(("Doğum yeri", identity.get("birth_place") or "Belirsiz"))
        details = result.get("criminal_record", {})
        pairs += [
            (header, details.get(key) or "Belirsiz")
            for key, header in FIELD_LABELS.items()
            if key in details
        ]
    elif result.get("document_family") == "MEB":
        pairs += [
            ("Doğum yeri", identity.get("birth_place") or "Belirsiz"),
            ("Okulun ili/ilçesi", student.get("school_location") or "Belirsiz"),
            ("Okul adı", student.get("school_name") or "Belirsiz"),
            ("Alan", student.get("education_field") or "Belirsiz"),
            ("Dal", student.get("education_branch") or "Belirsiz"),
            ("Sınıf", student.get("class_level") or "Belirsiz"),
            ("Öğrenci numarası", student.get("student_number") or "Belirsiz"),
            ("Burslu / yatılı", student.get("scholarship_boarding") or "Belirsiz"),
        ]
    else:
        pairs += [
            ("Uyruk", identity.get("nationality") or "Belirsiz"),
            ("Üniversite", student.get("university") or "Belirsiz"),
            ("Fakülte", student.get("faculty") or "Belirsiz"),
            ("Bölüm", student.get("department") or "Belirsiz"),
            ("Program", student.get("program") or "Belirsiz"),
            ("Kayıt tarihi", student.get("registration_date") or "Belirsiz"),
            ("Eğitim türü", student.get("education_type") or "Belirsiz"),
            (
                "Öğrenim süresi",
                f"{student['education_duration_years']} yıl"
                if student.get("education_duration_years") is not None
                else "Belirsiz",
            ),
            ("Sınıf", student.get("class_level") or "Belirsiz"),
        ]
    if result.get("document_family") == "UNIVERSITY":
        pairs += [
            ("Doğum yeri", identity.get("birth_place") or "Belirsiz"),
            ("Öğrenci numarası", student.get("student_number") or "Belirsiz"),
            ("Burslu / yatılı", student.get("scholarship_boarding") or "Belirsiz"),
        ]
    if metadata.get("subtype") == "GRADUATION":
        years = student.get("education_duration_years")
        pairs.append(("Öğrenim süresi", f"{years} yıl" if years is not None else "Belirsiz"))
    pairs += [
        (
            title,
            student_status_label(result)
            if field == "student_status"
            else LABELS.get(result[field], "—"),
        )
        for title, field in (
            ("Doğrulanmış öğrencilik durumu", "student_status"),
            ("Sicil", "criminal_status"),
            ("Arşiv", "archive_status"),
        )
    ]
    if result.get("schema_version", 2) >= 5:
        pairs += [
            ("Belgedeki öğrencilik durumu", student.get("status_text") or "—"),
            ("Belge düzeni", metadata.get("layout", "UNKNOWN")),
            ("Kaynak formatı", metadata.get("source_format", "PDF")),
        ]
        keys = {label: key for key, label in FIELD_LABELS.items()}
        keys["TCKN (maskeli)"] = "identity"
        pairs = [
            (
                label,
                LABELS.get(result.get("field_states", {}).get(keys.get(label)), value)
                if value == "Belirsiz"
                else value,
            )
            for label, value in pairs
        ]
        pairs.append(("Alan durumları", field_state_summary(result) or "Tüm alanlar okunabildi"))
    if result.get("document_family") == "CRIMINAL_RECORD":
        pairs = [(k, v) for k, v in pairs if "öğrencilik" not in k]
    lines = [f"<p><b>{escape(k)}:</b> {escape(v)}</p>" for k, v in pairs]
    lines += ["<h2>Uyarılar</h2>"] + [f"<p>{escape(v)}</p>" for v in result["warnings"]]
    lines += ["<h2>Kanıt konumları</h2>"] + [
        f"<p>{escape(p.get('field', ''))}: Sayfa {p['page']}, "
        f"{escape(p['method'])}, {escape(str(p['bbox']))}</p>"
        for p in result["evidence"]
    ]
    lines += [
        "<p>Bu rapor resmî belge gerçeklik veya kişi doğrulaması değildir. "
        "TCKN kontrolü yalnız biçim kontrolüdür. Burs kabulü veya reddi oluşturmaz.</p>"
    ]
    # Bounded chunks keep every evidence reference readable, across multiple pages.
    with pymupdf.open() as pdf:
        for offset in range(0, len(lines), 16):
            page = pdf.new_page()
            html = "<h1>Belge Analiz Raporu</h1>" + "".join(lines[offset : offset + 16])
            page.insert_htmlbox(
                pymupdf.Rect(40, 40, 555, 800),
                html,
                css=(
                    "body {font-family: sans-serif; font-size: 11pt} "
                    "h1 {font-size: 20pt; color: #164b52} p {margin: 8px 0}"
                ),
            )
        return pdf.tobytes(garbage=4, deflate=True)
