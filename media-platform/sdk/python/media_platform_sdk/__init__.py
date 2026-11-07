"""media-platform ince Python istemcisi.

Tuketen projeler (ai-platform, heplin, ...) icin: asset submit, durum sorgu,
sonuc cekme (delete-on-delivery), iptal + webhook imza dogrulama. Standalone
paket; yalniz httpx'e bagimli (dogrulama saf stdlib)."""

from media_platform_sdk.client import Client, MediaPlatformError
from media_platform_sdk.webhook import SIGNATURE_HEADER, verify_webhook

__all__ = ["Client", "MediaPlatformError", "verify_webhook", "SIGNATURE_HEADER"]
__version__ = "0.1.0"
