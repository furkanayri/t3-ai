import math
import re

from platform_core.errors import DomainError
from services.evaluation.criminal import DETAIL_FIELDS

FIELDS = {
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
    "criminal",
    "archive",
    "birth_place",
    "school_location",
    "school_name",
    "education_field",
    "education_branch",
    "student_number",
    "scholarship_boarding",
}
FIELDS.update(DETAIL_FIELDS)
REASONS = {
    "PDF_RECOVERED",
    "UNSUPPORTED_LAYOUT",
    "PROFILE_NOT_VERIFIED",
    "RECORD_PRESENT",
    "DOCUMENT_TYPE_MISMATCH",
    "MULTIPLE_DOCUMENTS",
    "SUBJECT_AMBIGUOUS",
} | {f"{prefix}_{field.upper()}" for prefix in ("UNKNOWN", "CONFLICT") for field in FIELDS}


def _string(value, limit=300):
    return isinstance(value, str) and len(value) <= limit


def _iso_date(value):
    return _string(value, 10) and (not value or bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", value)))


def result_schema(value):
    if not isinstance(value, dict):
        raise DomainError("INVALID_OUTPUT", 422)
    try:
        expected = {
            "schema_version",
            "document_family",
            "student_status",
            "criminal_status",
            "archive_status",
            "identity_status",
            "identity",
            "document_metadata",
            "student",
            "reason_codes",
            "evidence",
            "warnings",
            "needs_ocr_pages",
            "field_states",
        }
        if value.get("schema_version") == 6:
            expected.add("criminal_record")
            if value.get("document_family") != "CRIMINAL_RECORD":
                raise ValueError()
            details = value["criminal_record"]
            if not isinstance(details, dict) or set(details) != set(DETAIL_FIELDS):
                raise ValueError()
            if not all(
                _string(v, 1000 if k.endswith("_text") else 300) for k, v in details.items()
            ):
                raise ValueError()
            if details["query_time"] and not re.fullmatch(
                r"(?:[01]\d|2[0-3]):[0-5]\d", details["query_time"]
            ):
                raise ValueError()
        if set(value) != expected or value["schema_version"] not in (5, 6, 7):
            raise ValueError()
        states = value["field_states"]
        if not isinstance(states, dict) or not set(states) <= FIELDS:
            raise ValueError()
        if not all(
            state in {"READABLE", "NOT_PRESENT", "UNREADABLE", "CONFLICT"}
            for state in states.values()
        ):
            raise ValueError()
        if value["document_family"] not in (
            "YOK",
            "MEB",
            "UNIVERSITY",
            "CRIMINAL_RECORD",
            "UNKNOWN",
        ):
            raise ValueError()
        if value["student_status"] not in ("", "ACTIVE", "PASSIVE", "OTHER", "UNKNOWN"):
            raise ValueError()
        if value["criminal_status"] not in ("", "PRESENT", "NONE", "UNKNOWN"):
            raise ValueError()
        if value["archive_status"] not in ("", "PRESENT", "NONE", "UNKNOWN"):
            raise ValueError()
        if value["identity_status"] not in ("READABLE", "PARTIAL", "UNKNOWN"):
            raise ValueError()
        if not (isinstance(value["warnings"], list) and set(value["warnings"]) <= REASONS):
            raise ValueError()
        if value["warnings"] != value["reason_codes"]:
            raise ValueError()

        identity = value["identity"]
        identity_keys = {
            "tckn",
            "full_name",
            "mother_name",
            "father_name",
            "birth_date",
            "nationality",
            "birth_place",
            "tckn_status",
            "name_status",
            "mother_name_status",
            "father_name_status",
            "birth_date_status",
            "nationality_status",
            "birth_place_status",
            "candidates",
        }
        if set(identity) != identity_keys:
            raise ValueError()
        if not (
            _string(identity["tckn"], 11)
            and (not identity["tckn"] or re.fullmatch(r"[0-9]{11}", identity["tckn"]))
        ):
            raise ValueError()
        for field in ("full_name", "mother_name", "father_name", "nationality", "birth_place"):
            if not _string(identity[field]):
                raise ValueError()
        if not _iso_date(identity["birth_date"]):
            raise ValueError()
        for field in (
            "tckn_status",
            "name_status",
            "mother_name_status",
            "father_name_status",
            "birth_date_status",
            "nationality_status",
            "birth_place_status",
        ):
            if identity[field] not in ("READABLE", "UNKNOWN"):
                raise ValueError()
        if not (isinstance(identity["candidates"], list) and len(identity["candidates"]) <= 120):
            raise ValueError()
        for candidate in identity["candidates"]:
            if set(candidate) != {"field", "value", "evidence", "reliable"}:
                raise ValueError()
            if candidate["field"] not in {
                "identity",
                "name",
                "mother_name",
                "father_name",
                "birth_date",
                "nationality",
                "birth_place",
            }:
                raise ValueError()
            if not _string(candidate["value"]) or type(candidate["reliable"]) is not bool:
                raise ValueError()

        metadata = value["document_metadata"]
        metadata_keys = {"barcode", "issue_date", "layout", "source_format"}
        if value["schema_version"] == 7:
            metadata_keys.add("subtype")
            if metadata["subtype"] not in {"GRADUATION", "ENROLLMENT"}:
                raise ValueError()
        if set(metadata) != metadata_keys:
            raise ValueError()
        if metadata["layout"] not in {
            "UNKNOWN",
            "CRIMINAL_EDEVLET",
            "YOK_EDEVLET",
            "MEB_EK17",
            "MEB_SCHOOL_LETTER",
            "MEB_EDEVLET_STANDARD",
            "MEB_EDEVLET_SECTIONED",
            "MEB_GRADUATION",
            "MEB_OPEN_EDUCATION",
            "UNIVERSITY_LETTER",
        }:
            raise ValueError()
        if metadata["source_format"] not in {"PDF", "JPEG", "PNG"}:
            raise ValueError()
        if not _string(metadata["barcode"], 40):
            raise ValueError()
        if metadata["barcode"] and not re.fullmatch(r"[A-Z0-9-]{8,40}", metadata["barcode"]):
            raise ValueError()
        if not _iso_date(metadata["issue_date"]):
            raise ValueError()

        student = value["student"]
        if set(student) != {
            "university",
            "faculty",
            "department",
            "program",
            "registration_date",
            "education_type",
            "education_duration_years",
            "status",
            "status_text",
            "class_level",
            "school_location",
            "school_name",
            "education_field",
            "education_branch",
            "student_number",
            "scholarship_boarding",
        }:
            raise ValueError()
        for field in (
            "university",
            "faculty",
            "department",
            "program",
            "education_type",
            "class_level",
            "school_location",
            "school_name",
            "education_field",
            "education_branch",
            "student_number",
            "scholarship_boarding",
        ):
            if not _string(student[field]):
                raise ValueError()
        if not _string(student["status_text"], 1000):
            raise ValueError()
        if not _iso_date(student["registration_date"]):
            raise ValueError()
        if student["education_duration_years"] is not None and not (
            type(student["education_duration_years"]) is int
            and 1 <= student["education_duration_years"] <= 20
        ):
            raise ValueError()
        if student["status"] != value["student_status"]:
            raise ValueError()

        if not (isinstance(value["reason_codes"], list) and len(value["reason_codes"]) <= 50):
            raise ValueError()
        if not set(value["reason_codes"]) <= REASONS:
            raise ValueError()
        if not (isinstance(value["evidence"], list) and len(value["evidence"]) <= 80):
            raise ValueError()
        for proof in value["evidence"]:
            if proof.get("field") not in FIELDS:
                raise ValueError()
            if set(proof) != {"block_id", "page", "bbox", "method", "field"}:
                raise ValueError()
            if not re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", proof["block_id"]):
                raise ValueError()
            if not (type(proof["page"]) is int and 1 <= proof["page"] <= 20):
                raise ValueError()
            if proof["method"] not in ("PDF_TEXT", "OCR"):
                raise ValueError()
            if not (
                len(proof["bbox"]) == 4
                and all(
                    isinstance(item, (int, float)) and math.isfinite(item) for item in proof["bbox"]
                )
            ):
                raise ValueError()
        if not (isinstance(value["needs_ocr_pages"], list) and len(value["needs_ocr_pages"]) <= 20):
            raise ValueError()
        if not all(type(page) is int and 1 <= page <= 20 for page in value["needs_ocr_pages"]):
            raise ValueError()
    except (AssertionError, KeyError, TypeError, ValueError):
        raise DomainError("INVALID_OUTPUT", 422) from None
    return value
