"""Excel 'Kriterler' sayfasini ayristirir ve ai-platform icin prompt/sema uretir.

Kriterler sayfasi yapisi:
- Sutun A: Degerlendirme Sorusu (yalnizca blogun ilk satirinda dolu)
- Sutun B: Verilecek Puan (tek sayi "10" veya aralik "0-3")
- Sutun C: Puan Karsiligi / Degerlendirme Kriteri (kategori aciklamasi)

Her soru icin iki mod:
- "category": tum puanlar tek sayi. Model uyan secenegin puanini izinli
  puanlar arasindan dogrudan verir.
- "score":   puanlar aralik iceriyor. Model [min, max] araligina tam sayi puan verir
  (ornegin motivasyon yazisi 0-10).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

# en-dash, em-dash, normal tire ve "ile" gibi aralik ayiricilari
_RANGE_RE = re.compile(r"^\s*(\d+(?:[.,]\d+)?)\s*[\u2010-\u2015\-/]\s*(\d+(?:[.,]\d+)?)\s*$")

# ai-platform semayi JSONB'de saklar; JSONB nesne anahtarlarini once uzunluga gore
# siralar ve Ollama alanlari bu sirayla uretir. Gerekce anahtari puan anahtarindan
# kisa olmali ki model gerekceyi puandan once yazsin.
_REASON_KEY = "gerekce"
_POINTS_KEY = "verilen_puan"

# Excel rubrigini netlestiren ek kurallar. Excel'deki puanlari DEGISTIRMEZ; yalnizca
# kucuk modelin analojiyle ust kategoriye cikmasini engellemek icin soru basligindaki
# anahtar kelimeye gore secenek listesinin altina eklenir.
_CLARIFICATIONS: list[tuple[tuple[str, ...], list[str]]] = [
    (
        ("egitmenlik", "eğitmenlik"),
        [
            "Puan icin aday BASKALARINA EGITIM VERDIGINI acikca yazmali; egitim/sertifika "
            "ALMIS olmak veya bir alanda calismis olmak egitmenlik SAYILMAZ.",
            "En yuksek puan yalnizca aday dogrudan FPV DRON ogrettiyse verilir. Havacilik "
            "ogretmenligi, pilotluk, genel dron kullanimi veya 'benzer' deneyim tek basina "
            "en yuksek puani VERMEZ.",
            "Normal dron/IHA egitmenligi bir alt secenege; elektronik, yazilim, STEM, "
            "robotik veya kodlama egitmenligi en dusuk pozitif secenege yazilir.",
        ],
    ),
    (
        ("dron kullan",),
        [
            "Aday daha once hic dron kullanmadigini soyluyorsa 0 puanli secenek secilir.",
        ],
    ),
]


def _clarifications_for(title: str) -> list[str]:
    low = title.lower()
    for keys, rules in _CLARIFICATIONS:
        if any(k in low for k in keys):
            return rules
    return []


@dataclass
class Category:
    index: int
    points: float
    description: str
    label: str = ""  # Excel'deki ham puan hucresi ("10" veya "0-3")


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


def _allowed_points(question: Question) -> list[int]:
    """Kategori modundaki soru icin izinli (tekil, artan) tam sayi puanlar."""

    return sorted({int(round(c.points)) for c in question.categories})


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
        question.categories.append(Category(idx, (lo + hi) / 2.0, description, points_cell))
        question._lo = min(getattr(question, "_lo", lo), lo)  # type: ignore[attr-defined]
        question._hi = max(getattr(question, "_hi", hi), hi)  # type: ignore[attr-defined]
    else:
        value = _num(points_cell)
        question.categories.append(
            Category(idx, value if value is not None else 0.0, description, points_cell)
        )


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
    """ai-platform'un destekledigi JSON Schema altkumesiyle cikti semasi uretir.

    Her soru icin ayni sekil: once ``gerekce`` (metin), sonra ``verilen_puan``
    (tam sayi). Kategori modunda ``verilen_puan`` izinli puanlarla sinirlidir
    (enum); skor modunda [min, max] araligindadir.
    """

    properties: dict[str, Any] = {}
    required: list[str] = []
    for i, q in enumerate(questions):
        key = _qkey(i)
        reason_node = {
            "type": "string",
            "maxLength": 600,
            "description": "Once bunu yaz: kanita dayali kisa gerekce",
        }
        if q.mode == "category":
            points_node: dict[str, Any] = {
                "type": "integer",
                "enum": _allowed_points(q),
                "description": "Gerekceyle tutarli puan; yalnizca listelenen degerlerden biri",
            }
        else:
            points_node = {
                "type": "integer",
                "minimum": int(q.min_score),
                "maximum": int(q.max_score),
                "description": "Gerekceyle tutarli tam sayi puan",
            }
        node = {
            "type": "object",
            "properties": {_REASON_KEY: reason_node, _POINTS_KEY: points_node},
            "required": [_REASON_KEY, _POINTS_KEY],
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
        "degerlendirirsin. Her soru icin once kisa, Turkce ve kanita dayali bir "
        "gerekce yazarsin; sonra bu gerekceyle TUTARLI puani verirsin. Yalnizca "
        "verilen semaya uyan gecerli JSON uretirsin.\n"
        "Secenekli sorularda secenekler birbirini dislar. Yalnizca adayin cevabinda "
        "ACIK kanit bulunan secenegi sec. 'Benzer', 'karsilastirilabilir', 'yakin', "
        "'denk' gibi analojilerle bir ust puana CIKMA; kanit hangi seviyeye birebir "
        "uyuyorsa o puani ver. Kanit yoksa en dusuk secenek gecerlidir."
    )

    parts: list[str] = []
    if applicant_name:
        parts.append(f"ADAY: {applicant_name}\n")

    for i, q in enumerate(questions):
        answer = answers[i] if i < len(answers) else ""
        key = _qkey(i)
        parts.append(f"=== SORU {i + 1} ({key}): {q.title} ===")
        if q.mode == "category":
            parts.append("Secenekler (puan -> aciklama). Birbirini dislar, yalnizca BIR tane sec:")
            for cat in q.categories:
                parts.append(f"  {_fmt(cat.points)} puan -> {cat.description}")
            clar = _clarifications_for(q.title)
            if clar:
                parts.append("NET KURALLAR:")
                for rule in clar:
                    parts.append(f"  - {rule}")
            allowed = ", ".join(str(p) for p in _allowed_points(q))
            parts.append(
                f"-> {key}: once \"gerekce\" yaz (adayin cevabindaki hangi somut kanitin hangi "
                f"secenege birebir uydugunu belirt), sonra o secenegin puanini \"verilen_puan\" "
                f"alanina ver. Analojiyle ust puana cikma. \"verilen_puan\" yalnizca su "
                f"degerlerden biri olabilir: {allowed}."
            )
        else:
            parts.append("Puanlama rehberi (puan araligi -> aciklama):")
            for cat in q.categories:
                band = f"{cat.label} puan -> " if cat.label else ""
                parts.append(f"  {band}{cat.description}")
            parts.append(
                f"-> {key}: once \"gerekce\" yaz, sonra {int(q.min_score)}-{int(q.max_score)} "
                "arasi tam sayi \"verilen_puan\" ver."
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
        "ilgili anahtari (q1, q2, ...) doldur. Puan daima gerekceyle ayni yonde olsun."
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
        reasoning = str(node.get(_REASON_KEY, "")).strip()

        raw = node.get(_POINTS_KEY)
        value = _num(str(raw)) if raw is not None else None

        if q.mode == "category":
            allowed = _allowed_points(q)
            if value is None:
                chosen = min(allowed)
            elif int(round(value)) in allowed:
                chosen = int(round(value))
            else:
                # Sema disi bir deger gelirse en yakin izinli puana hizala.
                chosen = min(allowed, key=lambda p: abs(p - value))
            cat = next((c for c in q.categories if int(round(c.points)) == chosen), None)
            desc = cat.description if cat is not None else "-"
            scores.append(QuestionScore(q.title, float(chosen), q.max_score, desc, reasoning))
        else:
            if value is None:
                value = q.min_score
            value = max(q.min_score, min(q.max_score, value))
            scores.append(QuestionScore(q.title, value, q.max_score, "-", reasoning))
    return scores
