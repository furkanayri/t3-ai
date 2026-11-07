"""DomainError, document_control apps/core/errors.py'den sade sinif.

DRF'ye bagli `handler`/`MESSAGES` TASINMADI; yalnizca exception sinifi.
"""


class DomainError(Exception):
    def __init__(self, code, status=400):
        self.code, self.status = code, status
        super().__init__(code)
