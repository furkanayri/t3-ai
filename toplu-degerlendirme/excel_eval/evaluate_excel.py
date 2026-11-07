"""Excel basvurularini ai-platform uzerinden toplu degerlendirir.

Akis:
1. 'Kriterler' sayfasindan sorular + puanlama rubrigi okunur.
2. 'Basvurular' sayfasindan her aday icin cevaplar okunur.
3. Aday basina TEK is ai-platform'a gonderilir (3 soru birlikte, responseSchema ile).
4. Sonuclar toplanir ve yeni bir Excel dosyasina yazilir.

ai-platform'un yapisi degistirilmez; yalnizca genel HTTP API kullanilir.

Ornek:
    python -m excel_eval.evaluate_excel --limit 10
    python -m excel_eval.evaluate_excel \
        --excel "..\\FPV ... Degerlendirmesi.xlsx" --out "Sonuclar.xlsx"
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from openpyxl import Workbook, load_workbook

from excel_eval.ai_platform_client import AiPlatformClient, ApiError
from excel_eval.criteria import (
    Question,
    QuestionScore,
    build_messages,
    build_response_schema,
    parse_criteria,
    score_result,
)

DEFAULT_EXCEL = "FPV Eğitmen Eğitimi Başvuru -Yapay Zeka Değerlendirmesi.xlsx"
DEFAULT_OUT = "Değerlendirme Sonuçları.xlsx"
DEFAULT_CRITERIA_SHEET = "Kriterler"
DEFAULT_APPLICATIONS_SHEET = "Başvurular"

# Bu rubrige ozel netlestirme kurallari. Excel'e dokunmadan prompt'un
# "EK KURALLAR" bolumune eklenir; kategori sinirlarini sikilastirir.
EXTRA_RULES = [
    "Eğitmenlik puanı yalnızca alanı tam eşleşiyorsa en yüksek bandı alır: "
    "30 puan SADECE FPV dron eğitmenliğinde verilir. Normal dron/İHA "
    "eğitmenliği 20 puandır. Elektronik, yazılım, STEM, robotik, kodlama veya "
    "genel öğretmenlik/akademik deneyim en fazla 10 puandır; bunlar FPV veya "
    "dron eğitmenliği sayılmaz ve 20 ya da 30 puan alamaz.",
    "Dron kullanımı sorusunda 10 puan SADECE FPV dronu için verilir. "
    "Fotoğraf/Video dronu veya Diğer İHA/dron türleri 5 puandır. Hiç dron "
    "kullanmadığını belirten aday 0 puan alır.",
    "Deneyimi bir banda tam oturmuyorsa düşük olan bandı seç; emin değilsen "
    "bir alt puanı ver.",
]


@dataclass
class Applicant:
    row_index: int
    applicant_id: str
    name: str
    answers: list[str]


@dataclass
class Evaluation:
    applicant_id: str
    name: str
    scores: list[QuestionScore]
    total: float
    status: str  # "OK" | "HATA"
    error: str = ""


def _str(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def read_criteria(path: Path, sheet: str) -> tuple[list[Question], list[str]]:
    wb = load_workbook(path, read_only=True, data_only=True)
    try:
        ws = wb[sheet] if sheet in wb.sheetnames else wb.worksheets[0]
        rows = [list(r) for r in ws.iter_rows(values_only=True)]
    finally:
        wb.close()
    questions, notes = parse_criteria(rows)
    if not questions:
        raise SystemExit(f"'{sheet}' sayfasindan soru cikarilamadi.")
    return questions, notes


def read_applicants(path: Path, sheet: str, n_questions: int) -> list[Applicant]:
    wb = load_workbook(path, read_only=True, data_only=True)
    applicants: list[Applicant] = []
    try:
        ws = wb[sheet] if sheet in wb.sheetnames else wb.worksheets[1]
        for i, row in enumerate(ws.iter_rows(values_only=True)):
            if i == 0:  # baslik
                continue
            cells = list(row)
            applicant_id = _str(cells[0] if len(cells) > 0 else "")
            name = _str(cells[1] if len(cells) > 1 else "")
            if not applicant_id and not name:
                continue
            answers = [
                _str(cells[2 + j] if len(cells) > 2 + j else "")
                for j in range(n_questions)
            ]
            applicants.append(Applicant(i, applicant_id or f"row-{i}", name, answers))
    finally:
        wb.close()
    return applicants


class Checkpoint:
    """Tamamlanan degerlendirmeleri JSONL olarak saklar; yeniden calistirmada atlar."""

    def __init__(self, path: Path) -> None:
        self._path = path
        self._lock = threading.Lock()
        self.done: dict[str, dict[str, Any]] = {}
        if path.exists():
            with path.open("r", encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        rec = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if rec.get("status") == "OK":
                        self.done[str(rec["applicant_id"])] = rec

    def append(self, record: dict[str, Any]) -> None:
        with self._lock:
            with self._path.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps(record, ensure_ascii=False) + "\n")
            if record.get("status") == "OK":
                self.done[str(record["applicant_id"])] = record


def evaluate_one(
    client: AiPlatformClient,
    questions: list[Question],
    notes: list[str],
    applicant: Applicant,
    response_schema: dict[str, Any],
    *,
    poll_interval: float,
    job_timeout: float,
) -> Evaluation:
    messages = build_messages(
        questions, applicant.answers, notes, applicant_name=applicant.name
    )
    generation = {"temperature": 0.0, "maxOutputTokens": 1024}
    idem = f"excel-eval:v4:{applicant.applicant_id}"

    job_id = client.create_job(
        messages=messages,
        idempotency_key=idem,
        generation=generation,
        response_schema=response_schema,
    )
    res = client.wait_for_job(job_id, poll_interval=poll_interval, timeout=job_timeout)

    if res.status != "COMPLETED" or not isinstance(res.result, dict):
        err = (res.error or {}).get("message") if res.error else res.status
        return Evaluation(applicant.applicant_id, applicant.name, [], 0.0, "HATA", str(err))

    scores = score_result(questions, res.result)
    total = round(sum(s.points for s in scores), 2)
    return Evaluation(applicant.applicant_id, applicant.name, scores, total, "OK")


def _eval_to_record(ev: Evaluation) -> dict[str, Any]:
    return {
        "applicant_id": ev.applicant_id,
        "name": ev.name,
        "total": ev.total,
        "status": ev.status,
        "error": ev.error,
        "scores": [
            {
                "title": s.title,
                "points": s.points,
                "max_points": s.max_points,
                "category": s.category,
                "reasoning": s.reasoning,
            }
            for s in ev.scores
        ],
    }


def write_output(path: Path, questions: list[Question], records: list[dict[str, Any]]) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Sonuçlar"

    header = ["BAŞVURU ID", "ADI SOYADI"]
    for q in questions:
        header.append(f"{q.title} Puanı")
        header.append(f"{q.title} Gerekçe")
    max_total = sum(q.max_score for q in questions)
    header.append(f"Toplam (0-{int(max_total)})")
    header.append("Durum")
    ws.append(header)

    for rec in records:
        row: list[Any] = [rec.get("applicant_id", ""), rec.get("name", "")]
        scores = rec.get("scores", [])
        for i in range(len(questions)):
            if i < len(scores):
                row.append(scores[i].get("points", ""))
                row.append(scores[i].get("reasoning", ""))
            else:
                row.extend(["", ""])
        row.append(rec.get("total", ""))
        status = rec.get("status", "")
        if rec.get("error"):
            status = f"{status}: {rec['error']}"
        row.append(status)
        ws.append(row)

    wb.save(path)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Excel basvurularini ai-platform ile degerlendir")
    p.add_argument("--excel", default=None, help="Girdi Excel yolu")
    p.add_argument("--out", default=None, help="Cikti Excel yolu")
    p.add_argument("--criteria-sheet", default=DEFAULT_CRITERIA_SHEET)
    p.add_argument("--applications-sheet", default=DEFAULT_APPLICATIONS_SHEET)
    p.add_argument("--base-url", default=os.getenv("AI_PLATFORM_BASE_URL", "http://localhost:8080"))
    p.add_argument("--api-key", default=os.getenv("AI_PLATFORM_API_KEY", ""))
    p.add_argument("--limit", type=int, default=0, help="Yalnizca ilk N basvuru (0=tumu)")
    p.add_argument("--concurrency", type=int, default=2, help="Es zamanli is sayisi")
    p.add_argument("--poll-interval", type=float, default=2.0)
    p.add_argument("--job-timeout", type=float, default=1800.0)
    p.add_argument("--checkpoint", default=None, help="Checkpoint JSONL yolu")
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    # Yollari bu dosyanin ust klasorune (proje koku) gore cozumle.
    repo_root = Path(__file__).resolve().parent.parent.parent
    excel_path = Path(args.excel) if args.excel else repo_root / DEFAULT_EXCEL
    out_path = Path(args.out) if args.out else repo_root / "toplu-degerlendirme" / DEFAULT_OUT
    checkpoint_path = (
        Path(args.checkpoint)
        if args.checkpoint
        else out_path.with_suffix(".checkpoint.jsonl")
    )

    if not excel_path.exists():
        print(f"HATA: Excel bulunamadi: {excel_path}", file=sys.stderr)
        return 2
    if not args.api_key:
        print(
            "HATA: API anahtari gerekli. AI_PLATFORM_API_KEY ayarlayin veya --api-key verin.\n"
            "Anahtar uretmek icin ai-platform'da:\n"
            "  python -m app.cli create-project --code heplin --name Heplin\n"
            "  python -m app.cli create-api-key --project heplin --name excel-eval",
            file=sys.stderr,
        )
        return 2

    questions, notes = read_criteria(excel_path, args.criteria_sheet)
    notes = notes + EXTRA_RULES
    response_schema = build_response_schema(questions)
    applicants = read_applicants(excel_path, args.applications_sheet, len(questions))

    print(f"Sorular: {len(questions)} | Basvurular: {len(applicants)}")
    for q in questions:
        print(f"  - {q.title} (mod={q.mode}, maks={q.max_score:g})")

    if args.limit > 0:
        applicants = applicants[: args.limit]

    checkpoint = Checkpoint(checkpoint_path)
    pending = [a for a in applicants if a.applicant_id not in checkpoint.done]
    print(
        f"Degerlendirilecek: {len(pending)} "
        f"(atlanan/tamamlanmis: {len(applicants) - len(pending)})"
    )

    progress = {"done": 0, "ok": 0, "err": 0}
    plock = threading.Lock()
    started = time.monotonic()

    def worker(client: AiPlatformClient, applicant: Applicant) -> None:
        try:
            ev = evaluate_one(
                client,
                questions,
                notes,
                applicant,
                response_schema,
                poll_interval=args.poll_interval,
                job_timeout=args.job_timeout,
            )
        except ApiError as exc:
            ev = Evaluation(applicant.applicant_id, applicant.name, [], 0.0, "HATA", str(exc))
        except Exception as exc:  # noqa: BLE001 - tek basvuru hatasi tum isi durdurmasin
            ev = Evaluation(applicant.applicant_id, applicant.name, [], 0.0, "HATA", repr(exc))

        checkpoint.append(_eval_to_record(ev))
        with plock:
            progress["done"] += 1
            progress["ok" if ev.status == "OK" else "err"] += 1
            elapsed = time.monotonic() - started
            rate = progress["done"] / elapsed if elapsed > 0 else 0
            remaining = (len(pending) - progress["done"]) / rate if rate > 0 else 0
            print(
                f"[{progress['done']}/{len(pending)}] {applicant.applicant_id} "
                f"{ev.name[:30]:30} -> {ev.status} toplam={ev.total:g} "
                f"| ok={progress['ok']} hata={progress['err']} "
                f"| ~{remaining / 60:.1f} dk kaldi",
                flush=True,
            )

    if pending:
        with AiPlatformClient(args.base_url, args.api_key) as client:
            with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as pool:
                futures = [pool.submit(worker, client, a) for a in pending]
                for _ in as_completed(futures):
                    pass

    # Tum basvurular icin dosyayi yaz, giris sirasini koru. Checkpoint'ten her
    # aday icin SON kaydi al (OK veya HATA dahil edilsin).
    latest = _load_latest_records(checkpoint_path)
    records = [latest[a.applicant_id] for a in applicants if a.applicant_id in latest]
    write_output(out_path, questions, records)

    print(f"\nTamam. Cikti: {out_path}")
    print(f"Toplam OK={progress['ok']} HATA={progress['err']}")
    return 0


def _load_latest_records(checkpoint_path: Path) -> dict[str, dict[str, Any]]:
    """Checkpoint'teki her aday icin en son kaydi dondurur (OK veya HATA)."""

    latest: dict[str, dict[str, Any]] = {}
    if not checkpoint_path.exists():
        return latest
    with checkpoint_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            aid = str(rec.get("applicant_id"))
            # OK kaydi daha onceki HATA'yi ezsin; ayni id son kayitla guncellenir.
            if aid not in latest or rec.get("status") == "OK":
                latest[aid] = rec
    return latest


if __name__ == "__main__":
    raise SystemExit(main())
