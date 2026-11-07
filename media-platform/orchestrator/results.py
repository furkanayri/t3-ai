"""Sealed sonuc okuma/teslim/purge. Turetilmis veri kalici DEGIL: teslimde
(delete-on-delivery) ve kisa TTL backstop ile silinir."""

import json

from platform_core.crypto import open_value
from platform_core.errors import DomainError
from orchestrator import db
from orchestrator.models import ProcessingJob, SealedResult, utcnow

PUBLIC_FIELDS = (
    "schema_version",
    "document_family",
    "student_status",
    "criminal_status",
    "archive_status",
    "identity_status",
    "document_metadata",
    "student",
    "field_states",
    "reason_codes",
    "warnings",
    "evidence",
)


def _row(sess, job_id, tenant_id):
    # Tenant submit'te donen job_id'yi tasir; sealed sonuc ise analiz job'ina
    # baglidir. Asset uzerinden cozeriz (hangi job id tutulursa tutulsun).
    job = sess.get(ProcessingJob, str(job_id))
    if job is None or job.asset.tenant_id != tenant_id:
        return None
    row = sess.query(SealedResult).filter_by(asset_id=job.asset_id).first()
    if row is None or row.tenant_id != tenant_id:
        return None
    if row.expires_at <= utcnow():
        sess.delete(row)
        sess.commit()
        return None
    return row


def _serialize(row):
    output = json.loads(open_value(row.envelope, f"result:{row.job_id}"))
    serialized = {
        "job_id": row.job_id,
        "asset_id": row.asset_id,
        "rule_version": row.rule_version,
        "profile_version": row.profile_version,
    }
    # Medya profili: muhurlu artefakt bir transcript. Belge alanlarini atla.
    if "segments" in output and output.get("schema_version") == 1:
        serialized["kind"] = "TRANSCRIPT"
        serialized["duration"] = output["duration"]
        serialized["engine_version"] = output["engine_version"]
        serialized["segments"] = output["segments"]
        serialized["text"] = " ".join(s["text"] for s in output["segments"]).strip()
        return serialized
    for field in PUBLIC_FIELDS:
        if field in output:
            serialized[field] = output[field]
    if "criminal_record" in output:
        serialized["criminal_record"] = output["criminal_record"]
    if "identity" in output:
        identity = output["identity"]
        tckn = identity.get("tckn", "")
        serialized["identity"] = {
            **{k: v for k, v in identity.items() if k != "tckn"},
            "tckn_mask": ("*******" + tckn[-4:]) if tckn else "",
        }
    return serialized


def read_result(tenant_id, job_id):
    """Teslim etmeden oku (idempotent). Yoksa/expired ise None."""
    with db.session() as sess:
        row = _row(sess, job_id, tenant_id)
        return _serialize(row) if row else None


def deliver(tenant_id, job_id):
    """Oku ve teslimde sil. Yoksa NOT_FOUND."""
    with db.session() as sess:
        row = _row(sess, job_id, tenant_id)
        if row is None:
            raise DomainError("NOT_FOUND", 404)
        serialized = _serialize(row)
        sess.delete(row)
        sess.commit()
        return serialized


def purge_expired():
    """TTL backstop: suresi dolan sealed sonuclari sil."""
    with db.session() as sess:
        rows = sess.query(SealedResult).filter(SealedResult.expires_at <= utcnow()).all()
        count = len(rows)
        for row in rows:
            sess.delete(row)
        sess.commit()
        return {"purged": count}
