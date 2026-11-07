"""Zero-regression parity harness (dijital-PDF yolu) — CI merge gate.

Garanti iki bagimsiz kapidan olusur:

1. Kaynak-kimlik kapisi (`scripts/sync_engines.py --check`): engine govdeleri
   document_control ile byte-identical; yalniz 3 whitelist import satiri farkli.
2. Golden-cikti kapisi (bu test): sabit sentetik korpus parse+validate
   engine'lerinden gecirilir ve dondurulmus golden JSON ile ALAN-ALAN kiyaslanir.
   Herhangi bir davranis kaymasi (engine duzenlemesi, bagimlilik yukseltmesi —
   or. opencv 4->5 raster degisimi, Python surumu) burada fail verir.

Golden `scripts/gen_golden.py` ile uretilir. Kapi 1 engine kaynagini
document_control'e esitledigi icin golden, document_control-ozdes engine'lerin
cikisini temsil eder; document_control'un canli 3.12 ortami hazir oldugunda ayni
korpus oradan yeniden yakalanip bu golden'a karsi dogrulanabilir.
"""

import json
from pathlib import Path

import pytest

from services.evaluation.contracts import result_schema
from services.evaluation.rules import parse, validate
from services.extraction.pdf import extract
from tests.parity_corpus import EVAL_CASES
from tests.synthetic import pdf as synthetic_pdf

GOLDEN_DIR = Path(__file__).parent / "golden"


def canonical(obj):
    """Tuple->list ve tip normalizasyonu icin JSON round-trip."""
    return json.loads(json.dumps(obj, ensure_ascii=False, sort_keys=True))


def run_eval_engine(document_type, extraction):
    """parse (ParsedFacts) + validate (EvaluationOutput) ciktilarini birlikte dondurur."""
    findings = parse(extraction, document_type)
    result = result_schema(validate(findings, document_type, None, True, True))
    return {"findings": findings, "result": result}


def extraction_projection(data):
    """Extraction engine'in surumden-bagimsiz, deterministik projeksiyonu.

    `engine_version` (pymupdf surum damgasi) ve kayan bbox'lar disarida birakilir;
    detection'i besleyen stabil alanlar (metin + sayfa gecisi + method) tutulur.
    """
    out = extract(data)
    return {
        "method": out["method"],
        "processed_pages": out["processed_pages"],
        "recovered": out["engine_version"].endswith("-recovered"),
        "texts": [block["text"] for block in out["blocks"]],
        "page_count": len(out["pages"]),
    }


# Extraction engine vakasi: gercek PDF byte'lari -> extract.
EXTRACTION_CASES = [
    ("extract_digital_pdf", synthetic_pdf()),
]


def _field_diffs(path, expected, actual, out):
    """Ilk farkli alanin tam yolunu toplar (okunabilir fail mesaji icin)."""
    if type(expected) is not type(actual):
        out.append(f"{path}: tip {type(expected).__name__} != {type(actual).__name__}")
        return
    if isinstance(expected, dict):
        for key in sorted(set(expected) | set(actual)):
            if key not in expected:
                out.append(f"{path}.{key}: golden'da yok, uretilen={actual[key]!r}")
            elif key not in actual:
                out.append(f"{path}.{key}: uretilende yok, golden={expected[key]!r}")
            else:
                _field_diffs(f"{path}.{key}", expected[key], actual[key], out)
    elif isinstance(expected, list):
        if len(expected) != len(actual):
            out.append(f"{path}: liste uzunlugu {len(expected)} != {len(actual)}")
        for index, (e, a) in enumerate(zip(expected, actual)):
            _field_diffs(f"{path}[{index}]", e, a, out)
    elif expected != actual:
        out.append(f"{path}: golden={expected!r} != uretilen={actual!r}")


def _assert_matches_golden(name, actual):
    golden_path = GOLDEN_DIR / f"{name}.json"
    assert golden_path.exists(), (
        f"golden eksik: {name}. Once `py scripts/gen_golden.py` calistir."
    )
    expected = json.loads(golden_path.read_text(encoding="utf-8"))
    actual = canonical(actual)
    if actual != expected:
        diffs = []
        _field_diffs(name, expected, actual, diffs)
        pytest.fail("parity drift (" + name + "):\n" + "\n".join(diffs[:40]))


@pytest.mark.parametrize(
    "name,document_type,extraction", EVAL_CASES, ids=[case[0] for case in EVAL_CASES]
)
def test_evaluation_parity(name, document_type, extraction):
    _assert_matches_golden(name, run_eval_engine(document_type, extraction))


@pytest.mark.parametrize("name,data", EXTRACTION_CASES, ids=[case[0] for case in EXTRACTION_CASES])
def test_extraction_parity(name, data):
    _assert_matches_golden(name, extraction_projection(data))
