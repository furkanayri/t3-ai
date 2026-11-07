"""Internal contracts. Text-bearing types MUST NOT be serialized to Celery messages."""

from dataclasses import dataclass
from enum import StrEnum
from typing import BinaryIO, Protocol


class SourceType(StrEnum):
    UPLOAD = "UPLOAD"
    URL = "URL"
    STORAGE_REFERENCE = "STORAGE_REFERENCE"


class DocumentType(StrEnum):
    STUDENT = "STUDENT"
    CRIMINAL_RECORD = "CRIMINAL_RECORD"


class StudentStatus(StrEnum):
    ACTIVE = "ACTIVE"
    PASSIVE = "PASSIVE"
    OTHER = "OTHER"
    UNKNOWN = "UNKNOWN"


class RecordStatus(StrEnum):
    PRESENT = "PRESENT"
    NONE = "NONE"
    UNKNOWN = "UNKNOWN"


@dataclass(frozen=True)
class EvidenceReference:
    method: str
    page: int  # One-based PDF page.
    block_id: str
    bbox: tuple[float, float, float, float]  # Unrotated PDF points, top-left origin.


@dataclass(frozen=True)
class TextBlock:
    block_id: str
    page: int
    bbox: tuple[float, float, float, float]
    text: str
    confidence: float | None = None  # OCR only, normalized to [0, 1].


@dataclass(frozen=True)
class ExtractionOutput:
    schema_version: int
    method: str  # PDF_TEXT or OCR
    engine_version: str
    blocks: tuple[TextBlock, ...]
    processed_pages: tuple[int, ...]


@dataclass(frozen=True)
class ParsedFacts:
    document_type: DocumentType
    student_status: StudentStatus | None
    criminal_status: RecordStatus | None
    archive_status: RecordStatus | None
    reason_codes: tuple[str, ...]
    evidence: tuple[EvidenceReference, ...]


@dataclass(frozen=True)
class EvaluationOutput:
    schema_version: int
    rule_version: str
    facts: ParsedFacts
    needs_ocr_pages: tuple[int, ...]
    identity_status: str
    warnings: tuple[str, ...]


class EphemeralStorage(Protocol):
    def put(self, document_id: str, kind: str, data: bytes, job_id: str | None = None) -> None: ...
    def read(self, document_id: str, kind: str, job_id: str | None = None) -> bytes: ...
    def remove(self, document_id: str, kind: str, job_id: str | None = None) -> None: ...


class OCREngine(Protocol):
    def extract(self, pdf: BinaryIO, *, pages: tuple[int, ...]) -> ExtractionOutput: ...


class Parser(Protocol):
    def parse(self, extraction: ExtractionOutput) -> ParsedFacts: ...


class Validator(Protocol):
    def validate(
        self, facts: ParsedFacts, *, previous: ParsedFacts | None, rule_version: str
    ) -> EvaluationOutput: ...
