"""Kuyruk mesaji kontrati. Payload ASLA serialize edilmez; mesajda yalnizca
job_id + stage + referanslar akar (document_control JobMessage deseni)."""

from dataclasses import asdict, dataclass
from enum import StrEnum
from uuid import UUID


class Operation(StrEnum):
    # Belge profili
    FETCH = "FETCH"
    INGEST = "INGEST"
    EXTRACT = "EXTRACT"
    OCR = "OCR"
    EVALUATE = "EVALUATE"
    # Medya profili (Faz 4)
    DEMUX = "DEMUX"
    ASR = "ASR"
    MERGE = "MERGE"


@dataclass(frozen=True)
class JobMessage:
    schema_version: int
    asset_id: str
    job_id: str
    operation: str
    correlation_id: str
    tenant_id: str  # tenant-fair scheduling icin (payload degil, metadata)

    def __post_init__(self):
        if type(self.schema_version) is not int or self.schema_version != 1:
            raise ValueError("Unsupported message schema")
        for field in ("asset_id", "job_id", "correlation_id"):
            value = getattr(self, field)
            if not isinstance(value, str):
                raise ValueError("Invalid reference")
            try:
                normalized = str(UUID(value))
            except ValueError:
                raise ValueError("Invalid reference") from None
            if value != normalized:
                raise ValueError("Reference must be a canonical UUID")
        if not isinstance(self.operation, str) or self.operation not in set(Operation):
            raise ValueError("Unsupported operation")
        if not isinstance(self.tenant_id, str) or not self.tenant_id:
            raise ValueError("Invalid tenant")

    @classmethod
    def from_dict(cls, payload):
        expected = {
            "schema_version",
            "asset_id",
            "job_id",
            "operation",
            "correlation_id",
            "tenant_id",
        }
        if not isinstance(payload, dict) or set(payload) != expected:
            raise ValueError("Invalid message fields")
        return cls(**payload)

    def to_dict(self):
        return asdict(self)
