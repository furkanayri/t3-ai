import pymupdf

IDENTITY = "10000000146"


def pdf(lines=None, *, scanned=False, rotation=0):
    lines = lines or [
        "SENTETIK TEST BELGESI",
        "YUKSEKOGRETIM KURULU",
        "OGRENCI BELGESI",
        f"T.C. KIMLIK NO: {IDENTITY}",
        "ADI SOYADI: Sentetik Kisi",
        "OGRENCI DURUMU: AKTIF",
    ]
    doc = pymupdf.open()
    page = doc.new_page()
    for index, line in enumerate(lines):
        page.insert_text((50, 65 + index * 32), line, fontsize=14)
    page.set_rotation(rotation)
    if scanned:
        pix = page.get_pixmap(dpi=180)
        image_doc = pymupdf.open()
        image_page = image_doc.new_page(width=page.rect.width, height=page.rect.height)
        image_page.insert_image(image_page.rect, stream=pix.tobytes("png"))
        doc.close()
        doc = image_doc
    data = doc.tobytes()
    doc.close()
    return data
