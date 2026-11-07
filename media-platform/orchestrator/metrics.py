"""Observability: durum anlik gorntusu + autoscale sinyali.

Metrikler kaynak-dogruluk tablosundan (Postgres/SQLite) okunur; kuyruk yalnizca
ipucu oldugundan backlog PENDING job'lardan hesaplanir (broker'a bagimli degil).
Autoscale: kaynak-sinifi basina backlog -> istenen worker sayisi; GPU tier'lari
(ocr/asr) hot-floor ile sifira inmez (cold load pahali)."""

import math

from sqlalchemy import func

from config.settings import settings
from orchestrator import db
from orchestrator.dispatch import get_dispatcher
from orchestrator.models import Asset, ProcessingJob, SealedResult, UsageLog, WebhookDelivery
from orchestrator.pipeline import ROLES, role_for

# Sifira inmeyen GPU inference tier'lari (sicak model VRAM'de kalir).
HOT_CLASSES = ("ocr", "asr")
RESOURCE_CLASSES = tuple(sorted(set(ROLES.values())))


def _counts(sess, column, model, **filters):
    query = sess.query(column, func.count()).group_by(column)
    if filters:
        query = query.filter_by(**filters)
    return {str(key): int(value) for key, value in query.all()}


def _backlog_by_class(sess):
    """PENDING job'lari asama -> kaynak sinifina indirger."""
    backlog = {}
    rows = (
        sess.query(ProcessingJob.stage, func.count())
        .filter(ProcessingJob.status == "PENDING")
        .group_by(ProcessingJob.stage)
        .all()
    )
    for stage, count in rows:
        resource_class = role_for(stage) or "unknown"
        backlog[resource_class] = backlog.get(resource_class, 0) + int(count)
    return backlog


def autoscale_plan(backlog_by_class):
    """backlog -> kaynak-sinifi basina istenen worker sayisi (hot-floor'lu)."""
    plan = {}
    for resource_class in RESOURCE_CLASSES:
        depth = backlog_by_class.get(resource_class, 0)
        floor = 1 if resource_class in HOT_CLASSES else 0
        desired = max(floor, math.ceil(depth / max(1, settings.AUTOSCALE_BATCH)))
        plan[resource_class] = min(desired, settings.AUTOSCALE_MAX_WORKERS)
    return plan


def snapshot():
    with db.session() as sess:
        backlog = _backlog_by_class(sess)
        data = {
            "assets_by_status": _counts(sess, Asset.status, Asset),
            "jobs_by_status": _counts(sess, ProcessingJob.status, ProcessingJob),
            "jobs_by_stage": _counts(sess, ProcessingJob.stage, ProcessingJob),
            "usage_by_event": _counts(sess, UsageLog.event, UsageLog),
            "webhooks_by_status": _counts(sess, WebhookDelivery.status, WebhookDelivery),
            "sealed_results": int(sess.query(func.count(SealedResult.id)).scalar() or 0),
            "backlog_by_class": backlog,
            "autoscale": autoscale_plan(backlog),
        }
    dispatcher = get_dispatcher()
    # RabbitDispatcher gibi uzak kuyruklar __len__ sunmaz; ipucu olarak atlanir.
    data["queue_depth"] = len(dispatcher) if hasattr(dispatcher, "__len__") else None
    return data
