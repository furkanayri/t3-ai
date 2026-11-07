"""Multi-tenant kota zorlama + kullanim/metering kaydi.

Kota iki boyutlu: (1) eszamanlilik — tenant'in in-flight asset sayisi; (2) gunluk
hacim — bugun submit edilen asset sayisi. Her ikisi de tenant_config'ten gelir
(platform_core.tenants), eksikse settings varsayilani. Kayitlar icerik tutmaz.
"""

from platform_core import tenants
from platform_core.errors import DomainError
from orchestrator.models import Asset, UsageLog, utcnow


def _day_start():
    return utcnow().replace(hour=0, minute=0, second=0, microsecond=0)


def enforce(sess, tenant_id):
    """Kota asiliyorsa QUOTA_EXCEEDED (429). submit icinde, kilit altinda cagrilir."""
    cfg = tenants.config_for(tenant_id)
    active = (
        sess.query(Asset)
        .filter(
            Asset.tenant_id == tenant_id,
            Asset.status.in_(("PENDING", "PROCESSING")),
            Asset.deleted_at.is_(None),
        )
        .count()
    )
    if active >= cfg["concurrency"]:
        raise DomainError("QUOTA_EXCEEDED", 429)
    today = (
        sess.query(UsageLog)
        .filter(
            UsageLog.tenant_id == tenant_id,
            UsageLog.event == "SUBMITTED",
            UsageLog.created_at >= _day_start(),
        )
        .count()
    )
    if today >= cfg["daily"]:
        raise DomainError("QUOTA_EXCEEDED", 429)


def record(sess, asset, event, units=1):
    sess.add(
        UsageLog(
            tenant_id=asset.tenant_id,
            asset_id=asset.id,
            profile=asset.profile,
            kind=asset.kind,
            event=event,
            units=units,
        )
    )
