"""Bounded input identification; decoding only happens after the malware scan."""

import io
import warnings

import pymupdf
from config.settings import settings
from PIL import Image, ImageOps, UnidentifiedImageError

from platform_core.errors import DomainError
from services.extraction.pdf import open_pdf

MAX_IMAGE_PIXELS = 25_000_000


def identify(data):
    if len(data) > settings.MAX_PDF_BYTES:
        raise DomainError("FILE_TOO_LARGE", 413)
    if data.startswith(b"%PDF-"):
        return "PDF"
    if data.startswith(b"\xff\xd8\xff"):
        return "JPEG"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "PNG"
    raise DomainError("FORMAT_UNSUPPORTED", 422)


def normalize(data):
    """Return a canonical PDF without trusting filenames, MIME headers or EXIF DPI."""
    source_format = identify(data)
    if source_format == "PDF":
        try:
            with open_pdf(data):
                pass
        except DomainError as error:
            if error.code != "PDF_UNSUPPORTED":
                raise
            from services.ingestion.pdf_recovery import recover

            return recover(data)
        return data
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as source:
                if source.format != source_format:
                    raise DomainError("IMAGE_INVALID", 422)
                if source.width * source.height > MAX_IMAGE_PIXELS:
                    raise DomainError("IMAGE_TOO_LARGE", 422)
                if getattr(source, "n_frames", 1) != 1:
                    raise DomainError("IMAGE_UNSUPPORTED", 422)
                source.load()
                oriented = ImageOps.exif_transpose(source)
                rgba = oriented.convert("RGBA")
                image = Image.new("RGB", rgba.size, "white")
                image.paste(rgba, mask=rgba.getchannel("A"))
                stream = io.BytesIO()
                image.save(stream, format="PNG")
                with pymupdf.open() as pdf:
                    page = pdf.new_page(
                        width=image.width * 72 / 150, height=image.height * 72 / 150
                    )
                    page.insert_image(page.rect, stream=stream.getvalue())
                    normalized = pdf.tobytes(deflate=True)
        if len(normalized) > settings.MAX_PDF_BYTES:
            raise DomainError("FILE_TOO_LARGE", 413)
        return normalized
    except DomainError:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise DomainError("IMAGE_TOO_LARGE", 422) from None
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError):
        raise DomainError("IMAGE_INVALID", 422) from None
