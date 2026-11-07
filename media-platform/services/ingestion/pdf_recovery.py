"""Bounded PDF structural recovery; called only after antivirus scanning."""

import os
import subprocess
import sys
import tempfile
from pathlib import Path

import pymupdf
from config.settings import settings

from platform_core.errors import DomainError
from services.extraction.pdf import open_pdf


def recover(data):
    with open_pdf(data, allow_repair=True) as original:
        dimensions = [(p.rect.width, p.rect.height) for p in original]
    if os.name != "posix":
        raise DomainError("PDF_RECOVERY_UNAVAILABLE", 503)
    with tempfile.TemporaryDirectory(prefix="pdf-recovery-") as folder:
        source, target = Path(folder) / "input.pdf", Path(folder) / "output.pdf"
        source.write_bytes(data)
        try:
            result = subprocess.run(
                [
                    sys.executable,
                    str(Path(__file__).with_name("recovery_runner.py")),
                    str(source),
                    str(target),
                ],
                capture_output=True,
                timeout=20,
                check=False,
            )
        except subprocess.TimeoutExpired:
            raise DomainError("PDF_RECOVERY_TIMEOUT", 422) from None
        except OSError:
            raise DomainError("PDF_RECOVERY_UNAVAILABLE", 503) from None
        if result.returncode not in (0, 3) or not target.is_file():
            raise DomainError("PDF_RECOVERY_FAILED", 422)
        if target.stat().st_size > settings.MAX_PDF_BYTES:
            raise DomainError("FILE_TOO_LARGE", 413)
        normalized = target.read_bytes()
        with open_pdf(normalized) as checked:
            if dimensions != [(p.rect.width, p.rect.height) for p in checked]:
                raise DomainError("PDF_RECOVERY_FAILED", 422)
            for page in checked:
                page.get_pixmap(matrix=pymupdf.Matrix(0.2, 0.2))
        normalized += b"\n% DOCUMENT_CONTROL_PDF_RECOVERED\n"
        if len(normalized) > settings.MAX_PDF_BYTES:
            raise DomainError("FILE_TOO_LARGE", 413)
        return normalized
