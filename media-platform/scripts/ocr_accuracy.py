"""OCR yolu accuracy / A-B harness (parity DEGIL — plan karari).

OCR yolu GPU-OCR'a gectigi icin dijital-PDF parity garantisi gecerli degildir;
yerine ETIKETLI ground-truth korpusuna karsi dogruluk olculur ve kabul esigi
kapisi uygulanir. Harness korpus-agnostiktir: korpus kullanici tarafindan saglanir.

Korpus formati (OCR_CORPUS_DIR veya --corpus):
  <ad>.pdf | <ad>.png | <ad>.jpg        # belge goruntusu/taramasi
  <ad>.json                             # beklenen alanlar (ground-truth)
      {"document_type": "STUDENT",
       "expected": {"student_status": "ACTIVE",
                    "identity.tckn": "10000000146",
                    "identity.full_name": "...",
                    "document_metadata.barcode": "..."}}

Beklenen anahtarlar, validate() EvaluationOutput'una noktali yollardir. Mevcut
her motor (tesseract baseline + gpu PaddleOCR) ayri ayri kosar; alan-bazli
dogruluk + motorlar arasi uyum raporlanir. gpu dogrulugu OCR_ACCEPT_THRESHOLD
altinda ise cikis kodu 1 (merge gate).
"""

import argparse
import json
import shutil
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import pymupdf  # noqa: E402

from config.settings import settings  # noqa: E402
from platform_core.errors import DomainError  # noqa: E402
from services.evaluation.rules import normalize, parse, validate  # noqa: E402
from services.ingestion.formats import normalize as to_pdf  # noqa: E402

DOC_EXTENSIONS = (".pdf", ".png", ".jpg", ".jpeg")


def _dig(obj, path):
    cur = obj
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def _match(expected, actual):
    return normalize(str(expected)) == normalize(str(actual or ""))


def _page_count(pdf):
    with pymupdf.open(stream=pdf, filetype="pdf") as doc:
        return doc.page_count


def _available_engines():
    engines = {}
    if shutil.which("tesseract"):
        from services.ocr.tesseract import extract as tesseract_extract

        engines["tesseract"] = tesseract_extract
    try:
        from services.ocr.gpu_ocr import _reader
        from services.ocr.gpu_ocr import extract as gpu_extract

        _reader(settings.PADDLE_LANG)  # model/paddle hazir mi?
        engines["gpu"] = gpu_extract
    except Exception:
        pass
    return engines


def _run_engine(extract, pdf, document_type):
    pages = list(range(1, _page_count(pdf) + 1))
    extraction = extract(pdf, pages, document_type)
    findings = parse(extraction, document_type)
    return validate(findings, document_type, None, True, True)


def _load_samples(corpus):
    samples = []
    for sidecar in sorted(corpus.glob("*.json")):
        meta = json.loads(sidecar.read_text(encoding="utf-8"))
        document = next(
            (corpus / (sidecar.stem + ext) for ext in DOC_EXTENSIONS
             if (corpus / (sidecar.stem + ext)).exists()),
            None,
        )
        if document is None:
            continue
        samples.append((sidecar.stem, document, meta))
    return samples


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus", default=settings.OCR_CORPUS_DIR)
    parser.add_argument("--threshold", type=float, default=settings.OCR_ACCEPT_THRESHOLD)
    parser.add_argument("--report", default=str(ROOT / "tests" / "ocr_accuracy" / "report.json"))
    args = parser.parse_args()

    if not args.corpus:
        print("OCR_CORPUS_DIR / --corpus verilmedi. Ground-truth korpus gerekli.")
        return 0
    corpus = Path(args.corpus)
    if not corpus.is_dir():
        print(f"korpus dizini yok: {corpus}")
        return 2

    engines = _available_engines()
    if not engines:
        print("Kullanilabilir OCR motoru yok (tesseract binary veya paddle+model).")
        return 0

    samples = _load_samples(corpus)
    if not samples:
        print(f"korpus bos: {corpus} (es .pdf/.png + .json ciftleri bulunamadi).")
        return 0

    # engine -> field -> [correct, total]
    stats = {name: defaultdict(lambda: [0, 0]) for name in engines}
    totals = {name: [0, 0] for name in engines}
    per_sample = []

    for name, document, meta in samples:
        document_type = meta.get("document_type", "STUDENT")
        expected = meta.get("expected", {})
        data = to_pdf(document.read_bytes())
        row = {"sample": name, "document_type": document_type, "engines": {}}
        for engine_name, extract in engines.items():
            try:
                result = _run_engine(extract, data, document_type)
                fields = {}
                for path, want in expected.items():
                    ok = _match(want, _dig(result, path))
                    fields[path] = ok
                    stats[engine_name][path][0] += int(ok)
                    stats[engine_name][path][1] += 1
                    totals[engine_name][0] += int(ok)
                    totals[engine_name][1] += 1
                row["engines"][engine_name] = {"fields": fields, "error": None}
            except DomainError as error:
                row["engines"][engine_name] = {"fields": {}, "error": error.code}
            except Exception as error:  # noqa: BLE001
                row["engines"][engine_name] = {"fields": {}, "error": type(error).__name__}
        per_sample.append(row)

    report = {
        "corpus": str(corpus),
        "sample_count": len(samples),
        "threshold": args.threshold,
        "engines": {},
        "samples": per_sample,
    }
    print(f"\nOCR accuracy — {len(samples)} ornek, esik={args.threshold:.2f}\n")
    for engine_name in engines:
        correct, total = totals[engine_name]
        overall = correct / total if total else 0.0
        field_acc = {
            path: (c / t if t else 0.0) for path, (c, t) in sorted(stats[engine_name].items())
        }
        report["engines"][engine_name] = {"overall": overall, "fields": field_acc}
        print(f"[{engine_name}] overall={overall:.3f} ({correct}/{total})")
        for path, acc in field_acc.items():
            print(f"    {path:32s} {acc:.3f}")

    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nrapor -> {report_path}")

    if "gpu" in engines:
        gpu_overall = report["engines"]["gpu"]["overall"]
        if gpu_overall < args.threshold:
            print(f"\nFAIL: gpu accuracy {gpu_overall:.3f} < esik {args.threshold:.2f}")
            return 1
        print(f"\nPASS: gpu accuracy {gpu_overall:.3f} >= esik {args.threshold:.2f}")
    else:
        print("\nNOT: gpu motoru yok (paddle+model vendor'lanmadi); esik kapisi degerlendirilmedi.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
