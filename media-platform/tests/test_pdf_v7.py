import pymupdf
import pytest

from platform_core.errors import DomainError
from services.extraction.pdf import open_pdf


def test_unused_xref_record_is_accepted():
    document = pymupdf.open()
    document.new_page()
    unused = document.get_new_xref()
    document.update_object(unused, "null")
    data = document.tobytes(garbage=0)
    document.close()
    with open_pdf(data) as opened:
        assert len(opened) == 1


def test_referenced_missing_object_is_rejected():
    document = pymupdf.open()
    document.new_page()
    document.xref_set_key(document.pdf_catalog(), "UnexpectedReference", "9999 0 R")
    data = document.tobytes()
    document.close()
    with pytest.raises(DomainError) as error:
        open_pdf(data)
    assert error.value.code == "PDF_BROKEN_REFERENCE"


def test_active_content_remains_rejected():
    document = pymupdf.open()
    document.new_page()
    document.xref_set_key(document.pdf_catalog(), "OpenAction", "<< /S /JavaScript /JS (x) >>")
    data = document.tobytes()
    document.close()
    with pytest.raises(DomainError) as error:
        open_pdf(data)
    assert error.value.code == "PDF_ACTIVE_CONTENT"
