#!/usr/bin/env python3
"""Read-only localhost dashboard for local comparison runs."""

import json
import math
import os
import re
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


RUNS_DIR = Path(os.getenv("RUNS_DIR", "/runs")).resolve()
HOST = os.getenv("DASHBOARD_HOST", "127.0.0.1")
PORT = int(os.getenv("DASHBOARD_PORT", "4180"))
RUN_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


def read_json(path, default=None):
    try:
        with path.open("r", encoding="utf-8") as source:
            return json.load(source)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def parse_time(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def mean(values):
    return sum(values) / len(values) if values else None


def pearson(left, right):
    if len(left) < 2:
        return None
    left_mean = mean(left)
    right_mean = mean(right)
    numerator = sum((a - left_mean) * (b - right_mean) for a, b in zip(left, right))
    left_square = sum((value - left_mean) ** 2 for value in left)
    right_square = sum((value - right_mean) ** 2 for value in right)
    denominator = math.sqrt(left_square * right_square)
    return numerator / denominator if denominator else None


def ranks(values):
    ordered = sorted(enumerate(values), key=lambda item: item[1])
    output = [0] * len(values)
    start = 0
    while start < len(ordered):
        end = start + 1
        while end < len(ordered) and ordered[end][1] == ordered[start][1]:
            end += 1
        rank = (start + 1 + end) / 2
        for index in range(start, end):
            output[ordered[index][0]] = rank
        start = end
    return output


def safe_run_dir(run_id):
    if not RUN_ID_PATTERN.fullmatch(run_id or ""):
        return None
    candidate = (RUNS_DIR / run_id).resolve()
    return candidate if candidate.parent == RUNS_DIR else None


def load_results(run_dir):
    results_dir = run_dir / "results"
    if not results_dir.is_dir():
        return []
    results = []
    for path in results_dir.glob("*.json"):
        value = read_json(path)
        if value:
            results.append(value)
    return results


def metrics(manifest, results):
    items = manifest.get("items", [])
    old_by_answer = {str(item.get("answerId")): item for item in items}
    completed = [item for item in results if str(item.get("answerId")) in old_by_answer]
    successful = [item for item in completed if item.get("status") == "SUCCESS" and isinstance(item.get("evaluationScore"), (int, float))]
    rows = []
    for result in successful:
        item = old_by_answer[str(result.get("answerId"))]
        old_score = float(item["oldScore"])
        new_score = float(result["evaluationScore"])
        difference = abs(old_score - new_score)
        rows.append({
            "answerId": str(result.get("answerId")),
            "fileKey": item.get("fileKey", ""),
            "questionId": item.get("questionId", ""),
            "question": item.get("question", ""),
            "oldScore": old_score,
            "newScore": new_score,
            "difference": difference,
            "similarity": max(0, 100 - 10 * difference),
            "processedAt": result.get("processedAt"),
            "processingTimeSeconds": result.get("diagnostics", {}).get("processingTimeSeconds"),
        })
    differences = [item["difference"] for item in rows]
    similarities = [item["similarity"] for item in rows]
    old_scores = [item["oldScore"] for item in rows]
    new_scores = [item["newScore"] for item in rows]
    groups = {}
    for row in rows:
        groups.setdefault(row["questionId"], []).append(row)
    question_breakdown = []
    for question_id, values in groups.items():
        question_breakdown.append({
            "questionId": question_id,
            "question": values[0]["question"],
            "count": len(values),
            "meanSimilarity": mean([item["similarity"] for item in values]),
            "mae": mean([item["difference"] for item in values]),
        })
    question_breakdown.sort(key=lambda item: item["question"])
    recent = sorted(rows, key=lambda item: item.get("processedAt") or "", reverse=True)[:10]
    total = len(items)
    completed_count = len(completed)
    failed = completed_count - len(successful)
    return {
        "total": total,
        "completed": completed_count,
        "success": len(successful),
        "failed": failed,
        "pending": max(0, total - completed_count),
        "progressPercent": (100 * completed_count / total) if total else 0,
        "meanSimilarity": mean(similarities),
        "effectiveSimilarity": (sum(similarities) / completed_count) if completed_count else None,
        "mae": mean(differences),
        "rmse": math.sqrt(mean([value ** 2 for value in differences])) if differences else None,
        "exactRate": (100 * len([value for value in differences if value < 0.005]) / len(differences)) if differences else None,
        "withinOneRate": (100 * len([value for value in differences if value <= 1]) / len(differences)) if differences else None,
        "withinTwoRate": (100 * len([value for value in differences if value <= 2]) / len(differences)) if differences else None,
        "pearson": pearson(old_scores, new_scores),
        "spearman": pearson(ranks(old_scores), ranks(new_scores)) if rows else None,
        "questionBreakdown": question_breakdown,
        "scorePairs": [{"old": item["oldScore"], "new": item["newScore"]} for item in rows],
        "recent": recent,
    }


def run_status(run_id):
    run_dir = safe_run_dir(run_id)
    manifest = read_json(run_dir / "manifest.json") if run_dir else None
    if not manifest:
        return None
    state = read_json(run_dir / "state.json", {})
    active = read_json(run_dir / "active.json")
    result = metrics(manifest, load_results(run_dir))
    started = parse_time(state.get("startedAt") or state.get("queuedAt") or manifest.get("createdAt"))
    now = datetime.now(timezone.utc)
    elapsed = max(0, (now - started).total_seconds()) if started else 0
    result["elapsedSeconds"] = round(elapsed, 1)
    average_seconds = mean([
        item.get("processingTimeSeconds") for item in result["recent"]
        if isinstance(item.get("processingTimeSeconds"), (int, float))
    ])
    result["estimatedRemainingSeconds"] = round(average_seconds * result["pending"], 1) if average_seconds else None
    if result["completed"] >= result["total"] and result["total"]:
        status = "completed_with_errors" if result["failed"] else "completed"
    elif active:
        status = "processing"
    else:
        status = state.get("status", "prepared")
    return {
        "runId": run_id,
        "createdAt": manifest.get("createdAt"),
        "sampleSize": manifest.get("sampleSize", len(manifest.get("items", []))),
        "seed": manifest.get("seed"),
        "historicalModel": manifest.get("historicalModel", "gemma3:12b"),
        "newModels": manifest.get("newModels", {"whisper": "large-v3", "llm": "gemma3:4b"}),
        "status": status,
        "active": active,
        "metrics": result,
        "reportReady": (run_dir / "report.html").is_file(),
    }


def list_runs():
    if not RUNS_DIR.is_dir():
        return []
    values = []
    for path in RUNS_DIR.iterdir():
        if path.is_dir() and RUN_ID_PATTERN.fullmatch(path.name):
            status = run_status(path.name)
            if status:
                values.append({
                    "runId": status["runId"], "createdAt": status["createdAt"],
                    "status": status["status"], "metrics": {
                        "total": status["metrics"]["total"],
                        "completed": status["metrics"]["completed"],
                        "meanSimilarity": status["metrics"]["meanSimilarity"],
                    },
                })
    return sorted(values, key=lambda item: item.get("createdAt") or "", reverse=True)


DASHBOARD_HTML = r"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yerel AI Karşılaştırması</title><style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui;color:#172033;background:#f5f7fb}*{box-sizing:border-box}body{margin:0}.wrap{max-width:1240px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center}.pill{padding:7px 12px;border-radius:999px;background:#ede9fe;color:#6d28d9;font-weight:700}.card{background:white;border:1px solid #e6eaf2;border-radius:18px;padding:20px;margin-top:16px;box-shadow:0 8px 28px #1118270b}.progress{height:14px;background:#edf0f5;border-radius:99px;overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,#7c3aed,#22c55e);transition:width .4s}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px}.metric{border:1px solid #edf0f5;border-radius:13px;padding:14px;color:#64748b}.metric b{display:block;color:#172033;font-size:26px;margin-top:5px}.charts{display:grid;grid-template-columns:1fr 1fr;gap:16px}canvas{width:100%;height:260px}.muted{color:#64748b}.active{padding:12px;border-radius:12px;background:#f5f3ff;margin-top:12px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #edf0f5}th{color:#64748b}.button{display:inline-block;padding:10px 14px;background:#6d28d9;color:white;text-decoration:none;border-radius:10px}.hidden{display:none}@media(max-width:800px){.charts{grid-template-columns:1fr}.wrap{padding:16px}.top{align-items:flex-start;flex-direction:column}}</style></head><body><main class="wrap"><div class="top"><div><h1>Yerel AI Karşılaştırması</h1><div class="muted" id="subtitle"></div></div><span class="pill" id="status">Yükleniyor</span></div><section class="card"><div class="top"><b id="progressText">0 / 0</b><span id="timing" class="muted"></span></div><div class="progress"><i id="progressBar" style="width:0"></i></div><div id="active" class="active hidden"></div></section><section class="card grid" id="metrics"></section><section class="charts"><div class="card"><h2>Eski / yeni puan dağılımı</h2><canvas id="scatter" width="560" height="260"></canvas></div><div class="card"><h2>Soru bazında benzerlik</h2><canvas id="questions" width="560" height="260"></canvas></div></section><section class="card"><div class="top"><h2>Son tamamlananlar</h2><a id="report" class="button hidden">Nihai rapor</a></div><table><thead><tr><th>Soru</th><th>Eski</th><th>Yeni</th><th>Benzerlik</th><th>Dosya</th></tr></thead><tbody id="recent"></tbody></table></section></main><script>
const runId=location.pathname.split('/')[2];const fmt=(v,d=2)=>v==null?'—':Number(v).toFixed(d);const duration=s=>{if(s==null)return'—';s=Math.max(0,Math.round(s));return `${Math.floor(s/3600)}s ${Math.floor(s%3600/60)}dk ${s%60}sn`};const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function scatter(canvas,pairs){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,p=32;c.clearRect(0,0,w,h);c.strokeStyle='#cbd5e1';c.strokeRect(p,10,w-p-10,h-p-10);c.strokeStyle='#94a3b8';c.beginPath();c.moveTo(p,h-p);c.lineTo(w-10,10);c.stroke();c.fillStyle='#7c3aedaa';pairs.forEach(x=>{const px=p+x.old/10*(w-p-10),py=h-p-x.new/10*(h-p-10);c.beginPath();c.arc(px,py,4,0,7);c.fill()})}
function bars(canvas,items){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);if(!items.length)return;const gap=3,bw=(w-20)/items.length-gap;c.fillStyle='#7c3aed';items.forEach((x,i)=>{const bh=(x.meanSimilarity||0)/100*(h-40);c.fillRect(10+i*(bw+gap),h-25-bh,bw,bh)});c.fillStyle='#64748b';c.font='11px sans-serif';c.fillText('0%',2,h-20);c.fillText('100%',2,12)}
async function update(){const r=await fetch(`/api/runs/${runId}/status`,{cache:'no-store'});if(!r.ok)return;const d=await r.json(),m=d.metrics;document.querySelector('#subtitle').textContent=`${d.runId} · ${d.historicalModel} → ${d.newModels.llm} · ${d.newModels.whisper}`;document.querySelector('#status').textContent=d.status;document.querySelector('#progressText').textContent=`${m.completed} / ${m.total} (%${fmt(m.progressPercent,1)})`;document.querySelector('#progressBar').style.width=`${m.progressPercent}%`;document.querySelector('#timing').textContent=`Geçen: ${duration(m.elapsedSeconds)} · Tahmini kalan: ${duration(m.estimatedRemainingSeconds)}`;const a=document.querySelector('#active');if(d.active){a.classList.remove('hidden');a.textContent=`İşleniyor: ${d.active.question} · ${d.active.fileKey.slice(0,18)}…`}else a.classList.add('hidden');const values=[['Başarılı',m.success],['Başarısız',m.failed],['Ortalama benzerlik',fmt(m.meanSimilarity)+'%'],['Etkin benzerlik',fmt(m.effectiveSimilarity)+'%'],['MAE',fmt(m.mae)],['RMSE',fmt(m.rmse)],['Tam eşleşme',fmt(m.exactRate)+'%'],['±1 puan',fmt(m.withinOneRate)+'%'],['±2 puan',fmt(m.withinTwoRate)+'%'],['Pearson',fmt(m.pearson,3)],['Spearman',fmt(m.spearman,3)]];document.querySelector('#metrics').innerHTML=values.map(x=>`<div class="metric">${x[0]}<b>${x[1]}</b></div>`).join('');document.querySelector('#recent').innerHTML=m.recent.map(x=>`<tr><td>${esc(x.question)}</td><td>${fmt(x.oldScore)}</td><td>${fmt(x.newScore)}</td><td>${fmt(x.similarity)}%</td><td>${esc(x.fileKey.slice(0,18))}…</td></tr>`).join('');scatter(document.querySelector('#scatter'),m.scorePairs);bars(document.querySelector('#questions'),m.questionBreakdown);const report=document.querySelector('#report');if(d.reportReady){report.classList.remove('hidden');report.href=`/runs/${runId}/report`}}
update().catch(console.error);setInterval(()=>update().catch(console.error),2000);
</script></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def send_bytes(self, body, content_type, status=HTTPStatus.OK):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'")
        self.end_headers()
        self.wfile.write(body)

    def send_json(self, value, status=HTTPStatus.OK):
        self.send_bytes(json.dumps(value, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8", status)

    def redirect(self, location):
        self.send_response(HTTPStatus.FOUND)
        self.send_header("Location", location)
        self.end_headers()

    def do_GET(self):
        request_path = urlparse(self.path).path
        if request_path == "/api/runs":
            return self.send_json(list_runs())
        if request_path == "/api/runs/current":
            current = read_json(RUNS_DIR / "current.json", {})
            value = run_status(current.get("runId", ""))
            return self.send_json(value or {"error": "RUN_NOT_FOUND"}, HTTPStatus.OK if value else HTTPStatus.NOT_FOUND)
        match = re.fullmatch(r"/api/runs/([A-Za-z0-9_-]+)/status", request_path)
        if match:
            value = run_status(match.group(1))
            return self.send_json(value or {"error": "RUN_NOT_FOUND"}, HTTPStatus.OK if value else HTTPStatus.NOT_FOUND)
        match = re.fullmatch(r"/runs/([A-Za-z0-9_-]+)/report", request_path)
        if match:
            run_dir = safe_run_dir(match.group(1))
            report = run_dir / "report.html" if run_dir else None
            if report and report.is_file():
                return self.send_bytes(report.read_bytes(), "text/html; charset=utf-8")
            return self.send_json({"error": "REPORT_NOT_READY"}, HTTPStatus.NOT_FOUND)
        if re.fullmatch(r"/runs/[A-Za-z0-9_-]+", request_path):
            return self.send_bytes(DASHBOARD_HTML.encode("utf-8"), "text/html; charset=utf-8")
        if request_path == "/":
            current = read_json(RUNS_DIR / "current.json", {})
            if current.get("runId"):
                return self.redirect(f"/runs/{current['runId']}")
            return self.send_bytes("<h1>Henüz karşılaştırma koşusu yok.</h1>".encode(), "text/html; charset=utf-8")
        return self.send_json({"error": "NOT_FOUND"}, HTTPStatus.NOT_FOUND)

    def log_message(self, message, *args):
        print(f"dashboard: {message % args}")


if __name__ == "__main__":
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Dashboard ready: http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
