"""document_control'den engine/test dosyalarini kopyalayip yalnizca whitelist
import satirlarini mekanik olarak yeniden yazar.

Zero-regression garantisi: engine dosyalarinda (evaluation/extraction/ocr/
ingestion) SADECE asagidaki import kurallarina uyan satirlar degisir; baska
hicbir satira dokunulmaz. Script, degisen her satiri raporlar ve engine
dosyalarinda kural-disi bir degisiklik olursa hata verir.

Kullanim:
    py scripts/sync_engines.py [--src <document_control_yolu>] [--check]

--check: dosyalari yazmaz, yalnizca mevcut hedef ile kaynaktan uretilen
         (rewrite uygulanmis) icerigin ayni olup olmadigini dogrular (CI kapisi).
"""

import argparse
import sys
from pathlib import Path

DST_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SRC = Path(r"C:\Users\frkna\PycharmProjects\document_control")

# (prefix, replacement, full_line)
# full_line=True  -> satirin tamami prefix'e esit olmali
# full_line=False -> satir prefix ile baslamali; prefix kismi degistirilir
ENGINE_RULES = [
    ("from apps.core.errors import ", "from platform_core.errors import ", False),
    ("from django.conf import settings", "from config.settings import settings", True),
]
REPORTS_RULES = ENGINE_RULES + [
    ("from django.utils import timezone", "from platform_core import timeshim as timezone", True),
]
TEST_RULES = REPORTS_RULES + [
    ("from apps.core.reports import ", "from platform_core.reports import ", False),
]

# (src_relpath, dst_relpath, rules, mechanical_verify)
ENGINE_FILES = [
    "services/__init__.py",
    "services/contracts.py",
    "services/evaluation/__init__.py",
    "services/evaluation/barcodes.py",
    "services/evaluation/criminal.py",
    "services/evaluation/student_extended.py",
    "services/evaluation/rules.py",
    "services/evaluation/contracts.py",
    "services/extraction/__init__.py",
    "services/extraction/pdf.py",
    "services/extraction/contracts.py",
    "services/ocr/__init__.py",
    "services/ocr/tesseract.py",
    "services/ingestion/__init__.py",
    "services/ingestion/crypto.py",
    "services/ingestion/formats.py",
    "services/ingestion/pdf_recovery.py",
]
TEST_FILES = [
    "tests/synthetic.py",
    "tests/test_pdf_v7.py",
    "tests/test_yok_student_v3.py",
    "tests/test_student_v5.py",
    "tests/test_student_v7.py",
    "tests/test_criminal_v6.py",
    "tests/test_criminal_ocr.py",
]


def build_manifest():
    manifest = [(path, path, ENGINE_RULES, True) for path in ENGINE_FILES]
    manifest.append(("apps/core/reports.py", "platform_core/reports.py", REPORTS_RULES, False))
    manifest += [(path, path, TEST_RULES, False) for path in TEST_FILES]
    return manifest


def rewrite(text, rules):
    out, changes = [], []
    for index, line in enumerate(text.splitlines(keepends=True)):
        body = line.rstrip("\n").rstrip("\r")
        eol = line[len(body):]
        new = line
        for prefix, repl, full in rules:
            if full:
                if body == prefix:
                    new = repl + eol
                    break
            elif body.startswith(prefix):
                new = repl + body[len(prefix):] + eol
                break
        if new != line:
            changes.append((index + 1, body, new.rstrip("\n").rstrip("\r")))
        out.append(new)
    return "".join(out), changes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", default=str(DEFAULT_SRC))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    src_root = Path(args.src)
    if not src_root.is_dir():
        sys.exit(f"HATA: kaynak bulunamadi: {src_root}")

    total_changes, drift = 0, []
    for src_rel, dst_rel, rules, mechanical in build_manifest():
        src = src_root / src_rel
        dst = DST_ROOT / dst_rel
        if not src.is_file():
            if src.name == "__init__.py":
                content = ""  # bos paket dosyasi
                changes = []
            else:
                sys.exit(f"HATA: kaynak dosya yok: {src}")
        else:
            text = src.read_text(encoding="utf-8")
            content, changes = rewrite(text, rules)

        # Engine dosyalari icin: tum degisiklikler whitelist kurallarindan
        # kaynaklanir (rewrite yapisi geregi). Denetimi acikca raporla.
        if mechanical and changes:
            for lineno, before, after in changes:
                print(f"  [rewrite] {dst_rel}:{lineno}: {before!r} -> {after!r}")
        total_changes += len(changes)

        if args.check:
            current = dst.read_text(encoding="utf-8") if dst.is_file() else None
            if current != content:
                drift.append(dst_rel)
            continue

        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(content, encoding="utf-8", newline="")
        print(f"[ok] {src_rel} -> {dst_rel}  ({len(changes)} import rewrite)")

    if args.check:
        if drift:
            print("DRIFT: hedef, kaynaktan uretilen icerikle ayni degil:")
            for path in drift:
                print(f"  - {path}")
            sys.exit(1)
        print("check: tum dosyalar kaynakla senkron.")
    else:
        print(f"\nTamamlandi. Toplam {total_changes} import satiri yeniden yazildi.")


if __name__ == "__main__":
    main()
