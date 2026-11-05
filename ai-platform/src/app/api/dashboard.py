"""Canli metrik dashboard sayfasi.

Tek dosyalik, harici bagimliligi olmayan (CDN yok, offline calisir) bir HTML
sayfasi. Tarayici `/metrics` ucunu periyodik ceker, Prometheus text-format'ini
istemci tarafinda ayristirir ve canli olarak gosterir (sayac oranlari, histogram
yuzdelikleri p50/p95/p99, zaman serisi grafikleri). Python stringine gomuldugu
icin `pip install .` ile image'a dahildir.
"""

from __future__ import annotations

DASHBOARD_HTML = r"""<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI Platform — Canlı Metrikler</title>
<style>
  :root{
    --bg:#0b0f17; --panel:#141b2a; --panel2:#1b2436; --line:#243049;
    --text:#e6edf7; --muted:#8593ab; --accent:#4f9cff; --ok:#38d39f;
    --warn:#ffb020; --err:#ff5d6c; --chip:#0f1626;
  }
  *{box-sizing:border-box}
  html,body{margin:0;background:var(--bg);color:var(--text);
    font:14px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial}
  a{color:var(--accent)}
  header{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:16px;
    padding:12px 20px;background:rgba(11,15,23,.85);backdrop-filter:blur(8px);
    border-bottom:1px solid var(--line)}
  header h1{font-size:16px;margin:0;font-weight:650;letter-spacing:.2px}
  header .spacer{flex:1}
  .status{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--muted);
    box-shadow:0 0 0 3px rgba(255,255,255,.04)}
  .dot.live{background:var(--ok);animation:pulse 1.6s infinite}
  .dot.err{background:var(--err)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  select,button{background:var(--chip);color:var(--text);border:1px solid var(--line);
    border-radius:8px;padding:6px 10px;font:inherit;cursor:pointer}
  button:hover,select:hover{border-color:var(--accent)}
  main{padding:20px;max-width:1500px;margin:0 auto}
  .section-title{color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;
    font-size:11px;font-weight:700;margin:26px 2px 12px}
  .grid{display:grid;gap:14px}
  .cards{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
  .charts{grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}
  .lat{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
  .card{background:linear-gradient(180deg,var(--panel),var(--panel2));
    border:1px solid var(--line);border-radius:14px;padding:14px 16px}
  .card .label{color:var(--muted);font-size:12px;font-weight:600}
  .card .value{font-size:28px;font-weight:700;margin-top:6px;letter-spacing:.3px;
    font-variant-numeric:tabular-nums}
  .card .sub{color:var(--muted);font-size:12px;margin-top:4px;min-height:16px}
  .card .sub b{color:var(--accent);font-weight:700}
  .bar{height:7px;background:var(--chip);border-radius:6px;overflow:hidden;margin-top:10px}
  .bar>i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#7ab6ff);
    width:0;transition:width .4s ease}
  .bar.warn>i{background:linear-gradient(90deg,var(--warn),#ffd27a)}
  .bar.err>i{background:linear-gradient(90deg,var(--err),#ff9aa4)}
  .pill{display:inline-block;background:var(--chip);border:1px solid var(--line);
    border-radius:999px;padding:1px 8px;font-size:11px;color:var(--muted);margin-right:4px;
    font-variant-numeric:tabular-nums}
  .chartcard{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
  .chartcard .head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
  .chartcard .head .t{font-weight:650;font-size:13px}
  .chartcard .head .v{font-variant-numeric:tabular-nums;font-weight:700}
  canvas{width:100%;height:120px;display:block}
  .lat .card .value{font-size:20px}
  .lat .row{display:flex;justify-content:space-between;margin-top:8px;color:var(--muted);font-size:12px}
  .lat .row span{font-variant-numeric:tabular-nums;color:var(--text)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line);
    font-variant-numeric:tabular-nums}
  th{color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.6px}
  td.num,th.num{text-align:right}
  .muted{color:var(--muted)}
  .err-banner{display:none;margin:14px 0;padding:10px 14px;border:1px solid var(--err);
    background:rgba(255,93,108,.08);color:#ffd7db;border-radius:10px}
  .err-banner.show{display:block}
  footer{color:var(--muted);text-align:center;padding:30px 0 40px;font-size:12px}
</style>
</head>
<body>
<header>
  <h1>AI Platform · Canlı Metrikler</h1>
  <div class="status"><span id="dot" class="dot"></span><span id="statusText">bağlanıyor…</span></div>
  <div class="spacer"></div>
  <div class="status"><span>Son güncelleme:</span><b id="lastUpd" style="color:var(--text)">—</b></div>
  <label class="status">Aralık
    <select id="interval">
      <option value="1000">1 sn</option>
      <option value="2000" selected>2 sn</option>
      <option value="5000">5 sn</option>
      <option value="10000">10 sn</option>
    </select>
  </label>
  <button id="pause">⏸ Duraklat</button>
</header>

<main>
  <div id="errBanner" class="err-banner"></div>

  <div class="section-title">Genel durum</div>
  <div class="grid cards" id="cards"></div>

  <div class="section-title">Gecikme (latency) · p50 / p95 / p99</div>
  <div class="grid lat" id="latency"></div>

  <div class="section-title">Zaman serileri (oturum boyunca)</div>
  <div class="grid charts" id="charts"></div>

  <div class="section-title">API istekleri (duruma göre)</div>
  <div class="chartcard"><table id="apiTable">
    <thead><tr><th>Metot</th><th>Yol</th><th>Durum</th><th class="num">Toplam</th><th class="num">İstek/sn</th></tr></thead>
    <tbody></tbody></table></div>

  <footer>Kaynak: <code>/metrics/all</code> (API + worker + outbox + retry) · istemci tarafında işlenir · harici bağımlılık yok</footer>
</main>

<script>
"use strict";
const $ = s => document.querySelector(s);

/* ---------- Prometheus text-format ayrıştırıcı ---------- */
function parseProm(text){
  const out = {};
  const lines = text.split("\n");
  for(let i=0;i<lines.length;i++){
    const line = lines[i];
    if(!line || line.charCodeAt(0)===35) continue; // '#'
    const sp = line.lastIndexOf(" ");
    if(sp < 0) continue;
    const valStr = line.slice(sp+1);
    const namePart = line.slice(0,sp);
    const val = parseFloat(valStr);
    if(!isFinite(val) && valStr.indexOf("Inf")<0 && valStr!=="NaN") continue;
    let name = namePart, labels = null;
    const br = namePart.indexOf("{");
    if(br >= 0){
      name = namePart.slice(0,br);
      const body = namePart.slice(br+1, namePart.lastIndexOf("}"));
      labels = {};
      const re = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:\\.|[^"\\])*)"/g;
      let m;
      while((m = re.exec(body))){
        labels[m[1]] = m[2].replace(/\\"/g,'"').replace(/\\n/g,"\n").replace(/\\\\/g,"\\");
      }
    }
    (out[name] || (out[name] = [])).push({labels: labels||{}, value: val});
  }
  return out;
}
const sum = (s,n) => (s[n]||[]).reduce((a,x)=>a+(isFinite(x.value)?x.value:0),0);
function gauge(s,n,match){
  const arr = s[n]||[];
  for(const x of arr){
    if(!match) return x.value;
    let ok=true; for(const k in match){ if(x.labels[k]!==match[k]){ok=false;break;} }
    if(ok) return x.value;
  }
  return null;
}
/* Etiketli histogram'da tüm le kovalarını toplayıp global yüzdelik hesapla */
function histQuantile(s, base, q){
  const buckets = s[base+"_bucket"]; if(!buckets||!buckets.length) return null;
  const agg = {};
  for(const b of buckets){ const le=b.labels.le; agg[le]=(agg[le]||0)+b.value; }
  const arr = Object.keys(agg).map(le=>({le: le==="+Inf"?Infinity:parseFloat(le), c:agg[le]}))
                             .sort((a,b)=>a.le-b.le);
  if(!arr.length) return null;
  const total = arr[arr.length-1].c;
  if(!total) return 0;
  const rank = q*total;
  let prevC=0, prevLe=0;
  for(const b of arr){
    if(b.c >= rank){
      if(b.le===Infinity) return prevLe;
      const span = (b.c-prevC)||1;
      return prevLe + (b.le-prevLe)*((rank-prevC)/span);
    }
    prevC=b.c; if(b.le!==Infinity) prevLe=b.le;
  }
  return prevLe;
}
function histAvg(s, base){
  const c = sum(s, base+"_count"); if(!c) return null;
  return sum(s, base+"_sum")/c;
}

/* ---------- Sayaç oran (rate) takibi ---------- */
const prev = {};            // key -> {v, t}
function rate(key, v, t){
  const p = prev[key];
  prev[key] = {v, t};
  if(!p) return null;
  const dt = (t - p.t)/1000;
  if(dt <= 0) return null;
  if(v < p.v) return 0;     // counter reset
  return (v - p.v)/dt;
}

/* ---------- Basit canvas grafik ---------- */
class Spark{
  constructor(canvas, color, unit){
    this.c = canvas; this.ctx = canvas.getContext("2d");
    this.color = color; this.unit = unit||""; this.data = []; this.max = 120;
  }
  push(v){ if(v==null||!isFinite(v)) v=0; this.data.push(v); if(this.data.length>this.max) this.data.shift(); this.draw(); }
  draw(){
    const dpr = window.devicePixelRatio||1;
    const w = this.c.clientWidth, h = this.c.clientHeight;
    if(this.c.width!==w*dpr||this.c.height!==h*dpr){ this.c.width=w*dpr; this.c.height=h*dpr; }
    const ctx = this.ctx; ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    const d = this.data; if(!d.length) return;
    let mn=Math.min(...d), mx=Math.max(...d); if(mn===mx){ mx=mn+1; mn=Math.max(0,mn-1); }
    const pad=6, gh=h-pad*2, gw=w-pad*2;
    ctx.strokeStyle="rgba(255,255,255,.05)"; ctx.lineWidth=1;
    for(let i=0;i<=3;i++){ const y=pad+gh*i/3; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-pad,y); ctx.stroke(); }
    const x=i=>pad+(d.length<=1?gw:gw*i/(d.length-1));
    const y=v=>pad+gh-((v-mn)/(mx-mn))*gh;
    ctx.beginPath();
    for(let i=0;i<d.length;i++){ const px=x(i),py=y(d[i]); i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
    ctx.lineTo(x(d.length-1), pad+gh); ctx.lineTo(x(0), pad+gh); ctx.closePath();
    const g=ctx.createLinearGradient(0,pad,0,h); g.addColorStop(0,this.color+"55"); g.addColorStop(1,this.color+"00");
    ctx.fillStyle=g; ctx.fill();
    ctx.beginPath();
    for(let i=0;i<d.length;i++){ const px=x(i),py=y(d[i]); i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
    ctx.strokeStyle=this.color; ctx.lineWidth=1.8; ctx.stroke();
    const lastX=x(d.length-1), lastY=y(d[d.length-1]);
    ctx.fillStyle=this.color; ctx.beginPath(); ctx.arc(lastX,lastY,2.6,0,7); ctx.fill();
  }
}

/* ---------- Biçimlendirme ---------- */
const fmt = n => n==null?"—":(Math.abs(n)>=1000?Math.round(n).toLocaleString("tr-TR"):
  (Number.isInteger(n)?n.toLocaleString("tr-TR"):n.toFixed(2)));
const fmtRate = n => n==null?"—":n.toFixed(n<10?2:1);
const ms = s => s==null?"—":(s*1000>=1000?(s).toFixed(2)+" sn":Math.round(s*1000)+" ms");

/* ---------- Kart tanımları ---------- */
const CARD_DEFS = [
  {id:"created",   label:"Oluşturulan job",  get:s=>sum(s,"jobs_created_total"),   rate:"jobs_created_total"},
  {id:"completed", label:"Tamamlanan",       get:s=>sum(s,"jobs_completed_total"), rate:"jobs_completed_total"},
  {id:"failed",    label:"Başarısız",        get:s=>sum(s,"jobs_failed_total"),    tone:v=>v>0?"err":""},
  {id:"retried",   label:"Retry",            get:s=>sum(s,"jobs_retried_total"),   tone:v=>v>0?"warn":""},
  {id:"dlq",       label:"DLQ (dead-letter)",get:s=>sum(s,"jobs_dlq_total"),       tone:v=>v>0?"err":""},
  {id:"active",    label:"Aktif worker job", get:s=>gauge(s,"worker_active_jobs")},
  {id:"outbox",    label:"Outbox bekleyen",  get:s=>gauge(s,"outbox_pending"),     tone:v=>v>50?"warn":""},
  {id:"kafkalag",  label:"Kafka lag (toplam)",get:s=>sum(s,"kafka_consumer_lag"),  tone:v=>v>100?"warn":""},
  {id:"apireq",    label:"API istek (toplam)",get:s=>sum(s,"api_requests_total"),  rate:"api_requests_total", rateUnit:"istek/sn"},
  {id:"ptok",      label:"Prompt token",     get:s=>sum(s,"prompt_tokens_total")},
  {id:"ctok",      label:"Completion token", get:s=>sum(s,"completion_tokens_total")},
];
const LAT_DEFS = [
  {base:"api_request_duration_seconds",     label:"API yanıt süresi"},
  {base:"ollama_inference_duration_seconds",label:"Ollama inference"},
  {base:"job_total_duration_seconds",       label:"Job toplam süre"},
  {base:"job_queue_wait_seconds",           label:"Kuyruk bekleme (Kafka)"},
];
const CHART_DEFS = [
  {id:"c_apirate", title:"API istek / sn",   color:"#4f9cff", unit:"/sn", val:(s)=>rate("chart_api",sum(s,"api_requests_total"),Date.now())},
  {id:"c_comprate",title:"Tamamlanan / sn",  color:"#38d39f", unit:"/sn", val:(s)=>rate("chart_comp",sum(s,"jobs_completed_total"),Date.now())},
  {id:"c_infp95",  title:"Inference p95 (ms)",color:"#b388ff",unit:"ms",  val:(s)=>{const q=histQuantile(s,"ollama_inference_duration_seconds",.95);return q==null?null:q*1000;}},
  {id:"c_active",  title:"Aktif job",         color:"#ffb020", unit:"",   val:(s)=>gauge(s,"worker_active_jobs")},
  {id:"c_outbox",  title:"Outbox bekleyen",   color:"#ff5d6c", unit:"",   val:(s)=>gauge(s,"outbox_pending")},
  {id:"c_tps",     title:"Token / sn (ort.)", color:"#2dd4bf", unit:"t/sn",val:(s)=>histAvg(s,"tokens_per_second")},
];

/* ---------- DOM kurulumu ---------- */
function buildCards(){
  $("#cards").innerHTML = CARD_DEFS.map(d=>`
    <div class="card" data-card="${d.id}">
      <div class="label">${d.label}</div>
      <div class="value" id="v_${d.id}">—</div>
      <div class="sub" id="s_${d.id}">${d.id==="active"?'<div class="bar"><i id="bar_active"></i></div>':""}</div>
    </div>`).join("");
  $("#latency").innerHTML = LAT_DEFS.map(d=>`
    <div class="card">
      <div class="label">${d.label}</div>
      <div class="value" id="p95_${d.base}">—</div>
      <div class="row"><span class="muted">p50</span> <span id="p50_${d.base}">—</span></div>
      <div class="row"><span class="muted">p95</span> <span id="p95b_${d.base}">—</span></div>
      <div class="row"><span class="muted">p99</span> <span id="p99_${d.base}">—</span></div>
      <div class="row"><span class="muted">ort / sayı</span> <span id="avg_${d.base}">—</span></div>
    </div>`).join("");
  $("#charts").innerHTML = CHART_DEFS.map(d=>`
    <div class="chartcard">
      <div class="head"><span class="t">${d.title}</span><span class="v" id="cv_${d.id}" style="color:${d.color}">—</span></div>
      <canvas id="${d.id}"></canvas>
    </div>`).join("");
}
const charts = {};
function initCharts(){ for(const d of CHART_DEFS){ charts[d.id]=new Spark($("#"+d.id),d.color,d.unit); } }

/* ---------- Güncelleme döngüsü ---------- */
let timer=null, paused=false, intervalMs=2000;

function update(s){
  for(const d of CARD_DEFS){
    const v = d.get(s);
    $("#v_"+d.id).textContent = fmt(v);
    const card = document.querySelector(`[data-card="${d.id}"]`);
    if(d.tone){ card.style.borderColor = ({err:"var(--err)",warn:"var(--warn)"}[d.tone(v||0)]) || "var(--line)"; }
    if(d.rate){
      const r = rate("card_"+d.id, sum(s,d.rate), Date.now());
      $("#s_"+d.id).innerHTML = r==null?"&nbsp;":`<b>${fmtRate(r)}</b> ${d.rateUnit||"/sn"}`;
    }
  }
  const qf = gauge(s,"worker_queue_fill"), qc = gauge(s,"worker_queue_capacity");
  if(qf!=null){
    const pct = qc?Math.min(100,100*qf/qc):0;
    $("#s_active").innerHTML = `kuyruk <b>${fmt(qf)}</b>/${fmt(qc)} <div class="bar ${pct>80?'err':pct>50?'warn':''}"><i style="width:${pct}%"></i></div>`;
  }
  const dbA=gauge(s,"db_pool_connections",{state:"active"}),
        dbI=gauge(s,"db_pool_connections",{state:"idle"}),
        dbO=gauge(s,"db_pool_connections",{state:"overflow"});
  if(dbA!=null||dbI!=null){
    $("#s_apireq").innerHTML = `<span class="pill">DB aktif ${fmt(dbA||0)}</span><span class="pill">boşta ${fmt(dbI||0)}</span><span class="pill">overflow ${fmt(dbO||0)}</span>` +
      ($("#s_apireq").dataset.rate||"");
  }

  for(const d of LAT_DEFS){
    const p50=histQuantile(s,d.base,.5), p95=histQuantile(s,d.base,.95), p99=histQuantile(s,d.base,.99);
    const avg=histAvg(s,d.base), cnt=sum(s,d.base+"_count");
    $("#p95_"+d.base).textContent = ms(p95);
    $("#p50_"+d.base).textContent = ms(p50);
    $("#p95b_"+d.base).textContent = ms(p95);
    $("#p99_"+d.base).textContent = ms(p99);
    $("#avg_"+d.base).textContent = (avg==null?"—":ms(avg)) + " · " + fmt(cnt);
  }

  for(const d of CHART_DEFS){
    const v = d.val(s);
    charts[d.id].push(v);
    $("#cv_"+d.id).textContent = v==null?"—":(fmt(v)+(d.unit?" "+d.unit:""));
  }

  // API tablosu
  const rows = {};
  for(const x of (s["api_requests_total"]||[])){
    const k = (x.labels.method||"")+"|"+(x.labels.path||"")+"|"+(x.labels.status||"");
    rows[k] = {m:x.labels.method, p:x.labels.path, st:x.labels.status, v:x.value};
  }
  const tb = $("#apiTable tbody");
  const keys = Object.keys(rows).sort((a,b)=>rows[b].v-rows[a].v);
  tb.innerHTML = keys.length? keys.map(k=>{
    const r=rows[k]; const rt=rate("tbl_"+k, r.v, Date.now());
    const col = r.st>="500"?"var(--err)":r.st>="400"?"var(--warn)":"var(--ok)";
    return `<tr><td>${r.m||""}</td><td class="muted">${r.p||""}</td>
      <td style="color:${col}">${r.st||""}</td><td class="num">${fmt(r.v)}</td>
      <td class="num">${rt==null?"—":fmtRate(rt)}</td></tr>`;
  }).join("") : `<tr><td colspan="5" class="muted">Henüz istek yok.</td></tr>`;
}

function setStatus(state, text){
  const dot=$("#dot");
  dot.className = "dot " + (state==="live"?"live":state==="err"?"err":"");
  $("#statusText").textContent = text;
}

async function fetchMetrics(){
  // Tum process'leri toplayan /metrics/all tercih edilir; yoksa yerel /metrics.
  let res = await fetch("/metrics/all", {cache:"no-store"});
  if(res.status===404){ res = await fetch("/metrics", {cache:"no-store"}); }
  if(!res.ok) throw new Error("HTTP "+res.status);
  return res.text();
}
async function tick(){
  try{
    const text = await fetchMetrics();
    const s = parseProm(text);
    update(s);
    setStatus("live","canlı");
    $("#lastUpd").textContent = new Date().toLocaleTimeString("tr-TR");
    $("#errBanner").classList.remove("show");
  }catch(e){
    setStatus("err","bağlantı hatası");
    const b=$("#errBanner"); b.classList.add("show");
    b.textContent = "/metrics çekilemedi: "+e.message+" — API çalışıyor mu? (http://localhost:8080)";
  }
}
function loop(){ clearInterval(timer); if(!paused){ timer=setInterval(tick,intervalMs); } }

/* ---------- Kontroller ---------- */
$("#interval").addEventListener("change", e=>{ intervalMs=+e.target.value; loop(); });
$("#pause").addEventListener("click", ()=>{
  paused=!paused;
  $("#pause").textContent = paused?"▶ Devam":"⏸ Duraklat";
  setStatus(paused?"":"live", paused?"duraklatıldı":"canlı");
  loop();
});

buildCards(); initCharts(); setStatus("","bağlanıyor…"); tick(); loop();
</script>
</body>
</html>
"""
