"""Excel 'Kriterler' sayfasini ayristirir ve ai-platform icin prompt/sema uretir.

Kriterler sayfasi yapisi:
- Sutun A: Degerlendirme Sorusu (yalnizca blogun ilk satirinda dolu)
- Sutun B: Verilecek Puan (tek sayi "10" veya aralik "0-3")
- Sutun C: Puan Karsiligi / Degerlendirme Kriteri (kategori aciklamasi)

Her soru icin iki mod:
- "category": tum puanlar tek sayi. Model kategoriyi secer, puan kod tarafinda
  kategoriden deterministik atanir ("puanlar dogrudan kullanilir" kurali).
- "score":   puanlar aralik iceriyor. Model [min, max] araligina tam sayi puan
  verir (ornegin motivasyon yazisi 0-10).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

# en-dash, em-dash, normal tire ve "ile" gibi aralik ayiricilari
_RANGE_RE = re.compile(r"^\s*(\d+(?:[.,]\d+)?)\s*[\u2010-\u2015\-/]\s*(\d+(?:[.,]\d+)?)\s*$")


@dataclass
class Category:
    index: int
    points: float
    description: str


@dataclass
class Question:
    title: str
    mode: str  # "category" | "score"
    categories: list[Category]
    min_score: float
    max_score: float


@dataclass
class QuestionScore:
    title: str
    points: float
    max_points: float
    category: str  # secilen kategori aciklamasi veya "-"
    reasoning: str


def _num(text: str) -> float | None:
    try:
        return float(text.replace(",", "."))
    except (ValueError, AttributeError):
        return None


def _fmt(value: float) -> str:
    return str(int(value)) if float(value).is_integer() else str(value)


def _cell(row: list[Any], idx: int) -> str:
    if idx >= len(row):
        return ""
    value = row[idx]
    return "" if value is None else str(value).strip()


def parse_criteria(rows: list[list[Any]]) -> tuple[list[Question], list[str]]:
    """Kriterler satirlarindan sorulari ve serbest-metin notlari cikarir.

    ``rows`` baslik satirini da iceren tum satirlardir (sutun A/B/C degerleri).
    """

    questions: list[Question] = []
    notes: list[str] = []
    current: Question | None = None
    header_seen = False

    for row in rows:
        a, b, c = _cell(row, 0), _cell(row, 1), _cell(row, 2)

        if not a and not b and not c:
            continue

        # Baslik satirini atla (ilk anlamli satir).
        if not header_seen:
            header_seen = True
            if "soru" in a.lower() and "puan" in b.lower():
                continue

        has_category = bool(c) and bool(b)

        if a and has_category:
            # Yeni soru basligi + ilk kategori.
            current = Question(title=a, mode="category", categories=[], min_score=0.0, max_score=0.0)
            questions.append(current)
            _add_category(current, b, c)
        elif not a and has_category and current is not None:
            _add_category(current, b, c)
        elif a and not b and not c:
            # Alttaki serbest-metin yonlendirme notlari.
            notes.append(a)
        # diger durumlar (bos/eksik) yok sayilir

    for q in questions:
        _finalize(q)
    return questions, notes


def _add_category(question: Question, points_cell: str, description: str) -> None:
    idx = len(question.categories)
    rng = _RANGE_RE.match(points_cell)
    if rng:
        lo, hi = float(rng.group(1).replace(",", ".")), float(rng.group(2).replace(",", "."))
        question.mode = "score"
        # aralik moddaki kategoriler puan olarak ortalamayi tutar (yalnizca bilgi)
        question.categories.append(Category(idx, (lo + hi) / 2.0, description))
        question._lo = min(getattr(question, "_lo", lo), lo)  # type: ignore[attr-defined]
        question._hi = max(getattr(question, "_hi", hi), hi)  # type: ignore[attr-defined]
    else:
        value = _num(points_cell)
        question.categories.append(Category(idx, value if value is not None else 0.0, description))


def _finalize(question: Question) -> None:
    if question.mode == "score":
        question.min_score = getattr(question, "_lo", 0.0)
        question.max_score = getattr(question, "_hi", 10.0)
    else:
        pts = [c.points for c in question.categories] or [0.0]
        question.min_score = min(pts)
        question.max_score = max(pts)


def _qkey(index: int) -> str:
    return f"q{index + 1}"


def build_response_schema(questions: list[Question]) -> dict[str, Any]:
    """ai-platform'un destekledi=i JSON Schema altkumesiyle cikti semasi uretir."""

    properties: dict[str, Any] = {}
    required: list[str] = []
    for i, q in enumerate(questions):
        key = _qkey(i)
        if q.mode == "category":
            node = {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "integer",
                        "enum": [c.index for c in q.categories],
                        "description": "Secilen kategori numarasi",
                    },
                    "reasoning": {"type": "string", "maxLength": 600},
                },
                "required": ["category", "reasoning"],
                "additionalProperties": False,
            }
        else:
            node = {
                "type": "object",
                "properties": {
                    "score": {
                        "type": "integer",
                        "minimum": int(q.min_score),
                        "maximum": int(q.max_score),
                    },
                    "reasoning": {"type": "string", "maxLength": 600},
                },
                "required": ["score", "reasoning"],
                "additionalProperties": False,
            }
        properties[key] = node
        required.append(key)

    return {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False,
    }


def build_messages(
    questions: list[Question],
    answers: list[str],
    notes: list[str],
    *,
    applicant_name: str = "",
) -> list[dict[str, str]]:
    """Degerlendirme icin system + user mesajlarini olusturur."""

    system = (
        "Sen bir basvuru/mulakat degerlendirme asistanisin. Verilen degerlendirme "
        "kriterlerine gore adayin cevaplarini tarafsiz ve tutarli sekilde "
        "degerlendirirsin. Her soru icin yalnizca verilen semaya uyan gecerli JSON "
        "uretirsin. Gerekceleri kisa, Turkce ve kanita dayali yazarsin."
    )

    parts: list[str] = []
    if applicant_name:
        parts.append(f"ADAY: {applicant_name}\n")

    for i, q in enumerate(questions):
        answer = answers[i] if i < len(answers) else ""
        key = _qkey(i)
        parts.append(f"=== SORU {i + 1} ({key}): {q.title} ===")
        if q.mode == "category":
            parts.append("Kategoriler (uygun olani 'category' alaninda numarayla sec):")
            for cat in q.categories:
                parts.append(f"  [{cat.index}] {_fmt(cat.points)} puan -> {cat.description}")
            parts.append(
                f"-> {key}: {{\"category\": <0..{len(q.categories) - 1} arasi numara>, "
                "\"reasoning\": \"<kisa gerekce>\"}"
            )
        else:
            parts.append("Puanlama rehberi:")
            for cat in q.categories:
                parts.append(f"  {cat.description}")
            parts.append(
                f"-> {key}: {{\"score\": <{int(q.min_score)}-{int(q.max_score)} arasi tam sayi>, "
                "\"reasoning\": \"<kisa gerekce>\"}"
            )
        parts.append("ADAYIN CEVABI:")
        parts.append(answer.strip() or "(cevap bos)")
        parts.append("")

    if notes:
        parts.append("EK KURALLAR:")
        for note in notes:
            parts.append(f"- {note}")
        parts.append("")

    parts.append(
        "Tum sorulari degerlendir ve yalnizca gecerli JSON dondur. Her soru icin "
        "ilgili anahtari (q1, q2, ...) doldur."
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": "\n".join(parts)},
    ]


def score_result(questions: list[Question], result: dict[str, Any]) -> list[QuestionScore]:
    """Model ciktisini puanlara/gerekcelere donusturur (deterministik eslem)."""

    scores: list[QuestionScore] = []
    for i, q in enumerate(questions):
        key = _qkey(i)
        node = result.get(key) if isinstance(result, dict) else None
        node = node if isinstance(node, dict) else {}
        reasoning = str(node.get("reasoning", "")).strip()

        if q.mode == "category":
            idx = node.get("category")
            cat = next((c for c in q.categories if c.index == idx), None)
            if cat is None:
                scores.append(
                    QuestionScore(q.title, 0.0, q.max_score, "-", reasoning or "Kategori secilemedi")
                )
            else:
                scores.append(
                    QuestionScore(q.title, cat.points, q.max_score, cat.description, reasoning)
                )
        else:
            raw = node.get("score")
            value = _num(str(raw)) if raw is not None else None
            if value is None:
                value = q.min_score
            value = max(q.min_score, min(q.max_score, value))
            scores.append(QuestionScore(q.title, value, q.max_score, "-", reasoning))
    return scores
