"""Parity harness golden snapshot ureticisi.

Kullanim:
  py scripts/gen_golden.py           # golden'lari (yeniden) uretir
  py scripts/gen_golden.py --check   # golden guncel mi, degilse hata (CI)

Golden, mevcut media-platform engine'lerinin sabit korpus uzerindeki cikisini
dondurur. `scripts/sync_engines.py --check` engine kaynagini document_control
ile byte-identical tuttugu icin bu cikti document_control-ozdes engine'leri
temsil eder. Golden degisimi yalniz kasitli engine/surum degisiminde yapilmalidir.
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tests.test_parity import (  # noqa: E402
    EVAL_CASES,
    EXTRACTION_CASES,
    canonical,
    extraction_projection,
    run_eval_engine,
)

GOLDEN_DIR = ROOT / "tests" / "golden"


def _snapshots():
    for name, document_type, extraction in EVAL_CASES:
        yield name, canonical(run_eval_engine(document_type, extraction))
    for name, data in EXTRACTION_CASES:
        yield name, canonical(extraction_projection(data))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="golden drift kontrolu (CI)")
    args = parser.parse_args()

    GOLDEN_DIR.mkdir(parents=True, exist_ok=True)
    drift, written = [], []
    for name, payload in _snapshots():
        text = json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
        path = GOLDEN_DIR / f"{name}.json"
        if args.check:
            current = path.read_text(encoding="utf-8") if path.exists() else None
            if current != text:
                drift.append(name)
        else:
            path.write_text(text, encoding="utf-8")
            written.append(name)
            print(f"[golden] {name}")

    if args.check:
        if drift:
            print("golden drift (yeniden uret): " + ", ".join(drift))
            return 1
        print("check: tum golden'lar guncel.")
        return 0
    print(f"{len(written)} golden yazildi -> {GOLDEN_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
