"""ilk sema: projects, api_clients, jobs, job_attempts, outbox

Revision ID: 0001_initial
Revises:
Create Date: 2026-11-04
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("max_active_jobs", sa.Integer(), nullable=True),
        sa.Column("max_pending_jobs", sa.Integer(), nullable=True),
        sa.Column("max_output_tokens", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("code", name="uq_projects_code"),
    )

    op.create_table(
        "api_clients",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("secret_hash", sa.String(128), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_api_clients_project", "api_clients", ["project_id"])

    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("idempotency_key", sa.String(200), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("request_payload", postgresql.JSONB(), nullable=True),
        sa.Column("response_schema", postgresql.JSONB(), nullable=True),
        sa.Column("generation", postgresql.JSONB(), nullable=True),
        sa.Column("result", postgresql.JSONB(), nullable=True),
        sa.Column("model_provider", sa.String(40), nullable=False),
        sa.Column("model_name", sa.String(120), nullable=False),
        sa.Column("worker_id", sa.String(80), nullable=True),
        sa.Column("lease_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempt", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("next_retry_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_code", sa.String(60), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("prompt_tokens", sa.Integer(), nullable=True),
        sa.Column("completion_tokens", sa.Integer(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("purged_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("project_id", "idempotency_key", name="uq_jobs_project_idempotency"),
    )
    op.create_index("ix_jobs_project_created", "jobs", ["project_id", "created_at"])
    op.create_index("ix_jobs_status_updated", "jobs", ["status", "updated_at"])
    op.create_index("ix_jobs_status_next_retry", "jobs", ["status", "next_retry_at"])
    op.create_index("ix_jobs_status_lease", "jobs", ["status", "lease_until"])
    op.create_index("ix_jobs_created_at", "jobs", ["created_at"])

    op.create_table(
        "job_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("worker_id", sa.String(80), nullable=True),
        sa.Column("outcome", sa.String(20), nullable=True),
        sa.Column("error_code", sa.String(60), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("prompt_tokens", sa.Integer(), nullable=True),
        sa.Column("completion_tokens", sa.Integer(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("job_id", "attempt_number", name="uq_job_attempt_number"),
    )
    op.create_index("ix_job_attempts_job", "job_attempts", ["job_id"])

    op.create_table(
        "outbox",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("topic", sa.String(120), nullable=False),
        sa.Column("event_type", sa.String(60), nullable=False),
        sa.Column("event_version", sa.String(10), nullable=False, server_default=sa.text("'1'")),
        sa.Column("partition_key", sa.String(120), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("attempt", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="CASCADE"),
        sa.CheckConstraint("attempt >= 0", name="ck_outbox_attempt_nonneg"),
    )
    op.create_index("ix_outbox_status_available", "outbox", ["status", "available_at"])


def downgrade() -> None:
    op.drop_index("ix_outbox_status_available", table_name="outbox")
    op.drop_table("outbox")
    op.drop_index("ix_job_attempts_job", table_name="job_attempts")
    op.drop_table("job_attempts")
    op.drop_index("ix_jobs_created_at", table_name="jobs")
    op.drop_index("ix_jobs_status_lease", table_name="jobs")
    op.drop_index("ix_jobs_status_next_retry", table_name="jobs")
    op.drop_index("ix_jobs_status_updated", table_name="jobs")
    op.drop_index("ix_jobs_project_created", table_name="jobs")
    op.drop_table("jobs")
    op.drop_index("ix_api_clients_project", table_name="api_clients")
    op.drop_table("api_clients")
    op.drop_table("projects")
