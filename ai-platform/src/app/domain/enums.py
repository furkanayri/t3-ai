"""Job, outbox ve olay durum/enum tanimlari."""

from __future__ import annotations

from enum import StrEnum


class JobStatus(StrEnum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    RETRY = "RETRY"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    DEAD_LETTER = "DEAD_LETTER"


#: Worker/dispatcher tarafindan tekrar ele alinabilecek, "henuz bitmemis" durumlar.
ACTIVE_JOB_STATUSES: frozenset[JobStatus] = frozenset(
    {JobStatus.QUEUED, JobStatus.RUNNING, JobStatus.RETRY}
)
TERMINAL_JOB_STATUSES: frozenset[JobStatus] = frozenset(
    {JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.DEAD_LETTER}
)


class OutboxStatus(StrEnum):
    PENDING = "PENDING"
    PUBLISHED = "PUBLISHED"
    FAILED = "FAILED"  # max deneme asildi; manuel mudahale gerekir


class EventType(StrEnum):
    JOB_REQUESTED = "job.requested"
    JOB_COMPLETED = "job.completed"
    JOB_FAILED = "job.failed"
    JOB_RETRY = "job.retry"
    JOB_DEAD_LETTER = "job.dead_letter"


class ErrorCategory(StrEnum):
    #: Yeniden denenebilir (gecici) hatalar.
    TRANSIENT = "transient"
    #: Kalici hatalar; retry edilmez.
    PERMANENT = "permanent"


class ErrorCode(StrEnum):
    # Gecici
    OLLAMA_CONNECTION = "ollama_connection"
    OLLAMA_TIMEOUT = "ollama_timeout"
    OLLAMA_UNAVAILABLE = "ollama_unavailable"  # 429 / 5xx / model hazir degil
    DB_TRANSIENT = "db_transient"
    KAFKA_TRANSIENT = "kafka_transient"
    INTERNAL = "internal"

    # Kalici
    INVALID_REQUEST = "invalid_request"
    INPUT_LIMIT_EXCEEDED = "input_limit_exceeded"
    UNAUTHORIZED = "unauthorized"
    INVALID_RESPONSE_SCHEMA = "invalid_response_schema"
    SCHEMA_VALIDATION_FAILED = "schema_validation_failed"  # cikti semaya uymadi
    JOB_NOT_FOUND = "job_not_found"
    MALFORMED_MESSAGE = "malformed_message"
    RESULT_TOO_LARGE = "result_too_large"
    MODEL_OUTPUT_NOT_JSON = "model_output_not_json"


_TRANSIENT_CODES: frozenset[ErrorCode] = frozenset(
    {
        ErrorCode.OLLAMA_CONNECTION,
        ErrorCode.OLLAMA_TIMEOUT,
        ErrorCode.OLLAMA_UNAVAILABLE,
        ErrorCode.DB_TRANSIENT,
        ErrorCode.KAFKA_TRANSIENT,
        ErrorCode.INTERNAL,
    }
)


def category_of(code: ErrorCode) -> ErrorCategory:
    return ErrorCategory.TRANSIENT if code in _TRANSIENT_CODES else ErrorCategory.PERMANENT


def is_transient(code: ErrorCode) -> bool:
    return code in _TRANSIENT_CODES
