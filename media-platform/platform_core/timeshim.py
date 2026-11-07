"""django.utils.timezone'un reports.py + test yardimcilarinin kullandigi alt kumesi.

Yalnizca now(), localtime() ve datetime sinifi kullaniliyor. Sahte bir django
namespace'i tasimamak icin `from django.utils import timezone` importu bu module
`timezone` olarak yeniden yazilir.
"""

import datetime as _datetime
from datetime import datetime  # noqa: F401  (timezone.datetime.fromisoformat icin)


def now():
    return datetime.now(_datetime.timezone.utc)


def localtime(value=None):
    if value is None:
        value = now()
    return value.astimezone()
