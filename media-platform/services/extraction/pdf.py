import re

import pymupdf
from config.settings import settings

from platform_core.errors import DomainError


def _scan_objects(doc):
    pdf = pymupdf._as_pdf_document(doc)
    missing, references = set(), set()
    for xref in range(1, doc.xref_length()):
        entry = pymupdf.mupdf.ll_pdf_get_xref_entry(pdf.m_internal, xref)
        if entry.type in ("\x00", "f"):
            missing.add(xref)
            continue
        obj = doc.xref_object(xref, compressed=False)
        references.update(int(m[1]) for m in re.finditer(r"\b(\d+)\s+\d+\s+R\b", obj))
        if re.search(r"/(JavaScript|JS|Launch|RichMedia|EmbeddedFiles|AA|OpenAction)\b", obj):
            raise DomainError("PDF_ACTIVE_CONTENT", 422)
    if references & missing or any(x >= doc.xref_length() for x in references):
        raise DomainError("PDF_BROKEN_REFERENCE", 422)


def open_pdf(data, *, allow_repair=False):
    if not data.startswith(b"%PDF-") or len(data) > settings.MAX_PDF_BYTES:
        raise DomainError("PDF_INVALID", 422)
    try:
        doc = pymupdf.open(stream=data, filetype="pdf")
        if (
            doc.needs_pass
            or (doc.is_repaired and not allow_repair)
            or doc.page_count < 1
            or doc.page_count > settings.MAX_PDF_PAGES
        ):
            doc.close()
            raise DomainError("PDF_UNSUPPORTED", 422)
        if doc.embfile_count():
            doc.close()
            raise DomainError("PDF_ACTIVE_CONTENT", 422)
        _scan_objects(doc)
        return doc
    except DomainError:
        if "doc" in locals() and not doc.is_closed:
            doc.close()
        raise
    except Exception:
        if "doc" in locals() and not doc.is_closed:
            doc.close()
        raise DomainError("PDF_INVALID", 422) from None


def extract(data):
    with open_pdf(data) as doc:
        pages, blocks = [], []
        for number, page in enumerate(doc, 1):
            pages.append(
                {
                    "page": number,
                    "width": page.mediabox.width,
                    "height": page.mediabox.height,
                    "rotation": page.rotation,
                }
            )
            # A block bbox can cover many unrelated lines. Preserve the real
            # line bbox so table labels and values can be reconstructed by
            # their visual position (not by PDF object order).
            page_dict = page.get_text("dict", sort=True)
            for block_index, block in enumerate(page_dict.get("blocks", [])):
                if block.get("type") != 0:
                    continue
                for line_index, line in enumerate(block.get("lines", [])):
                    text = "".join(span.get("text", "") for span in line.get("spans", []))
                    if not text.strip():
                        continue
                    blocks.append(
                        {
                            "block_id": f"p{number}b{block_index}l{line_index}",
                            "page": number,
                            "bbox": list(line["bbox"]),
                            "text": text,
                            "confidence": None,
                        }
                    )
        return {
            "schema_version": 1,
            "method": "PDF_TEXT",
            "engine_version": pymupdf.VersionBind
            + ("-recovered" if data.endswith(b"% DOCUMENT_CONTROL_PDF_RECOVERED\n") else ""),
            "pages": pages,
            "processed_pages": [p["page"] for p in pages],
            "blocks": blocks,
        }
