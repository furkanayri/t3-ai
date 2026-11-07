"""Tenant config (kota + webhook) cozumleme.

Kaynak: token dosyasindaki `tenant_config` bolumu (bootstrap uretir / prod'da
SERVICE_TOKENS_FILE). Eksik alanlar settings varsayilanlarina duser. Surec-ici
cache; `reload()` ile sifirlanir (auth.reload_tokens bunu da tetikler)."""

from config.settings import settings
from platform_core import bootstrap

_config = None


def _load():
    global _config
    if _config is None:
        _config = bootstrap.ensure_tokens().get("tenant_config", {})
    return _config


def reload():
    global _config
    _config = None
    return _load()


def config_for(tenant_id):
    """tenant_id -> {concurrency, daily, weight, webhook_url, webhook_secret}.

    Bilinmeyen tenant da gecerli varsayilanlarla calisir (token zaten auth'ta
    dogrulanir; config yoksa varsayilan kota uygulanir)."""
    raw = _load().get(tenant_id, {})
    return {
        "concurrency": int(raw.get("concurrency") or settings.DEFAULT_TENANT_CONCURRENCY),
        "daily": int(raw.get("daily") or settings.DEFAULT_TENANT_DAILY),
        "weight": int(raw.get("weight") or settings.DEFAULT_TENANT_WEIGHT),
        "webhook_url": raw.get("webhook_url") or "",
        "webhook_secret": raw.get("webhook_secret") or "",
    }
