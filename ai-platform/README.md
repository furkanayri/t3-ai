# Merkezi LLM Platformu (ai-platform)

Kurum içindeki farklı projelerin (Heplin vb.) ortak bir HTTP API üzerinden
kullanabileceği, **yüksek performanslı ve güvenilir** merkezi bir LLM servisi.
İstemciler isteği gönderir, API **modeli beklemeden hemen `202 Accepted` döner**;
iş arka planda asenkron olarak işlenir ve istemci sonucu sorgulayarak (polling)
alır.

Bu servis `ai-platform/` klasöründe **bağımsız** olarak çalışır; depodaki diğer
projeleri etkilemez.

---

## 1. Mimari

```
                    ┌──────────────────────────────────────────────────────────┐
                    │                      Host makine                          │
                    │   ┌──────────────┐                                        │
   İstemci  ──HTTP──┼──▶│   LLM API    │  POST /v1/jobs  → 202 (model beklemez) │
   (Heplin) ◀──────┼───│  (FastAPI)   │  GET  /v1/jobs/{id} → durum + sonuç    │
                    │   └──────┬───────┘                                        │
                    │          │ job + outbox (AYNI transaction)               │
                    │          ▼                                               │
                    │   ┌──────────────┐   host.docker.internal:5432           │
                    │   │  PostgreSQL  │◀───────────── (Docker DEĞİL, host'ta) │
                    │   └──────┬───────┘                                        │
                    │          │ FOR UPDATE SKIP LOCKED                        │
                    │   ┌──────▼─────────┐     produce      ┌───────────────┐  │
                    │   │ Outbox Publisher│────────────────▶│     Kafka     │  │
                    │   └────────────────┘                  │    (KRaft)    │  │
                    │                                        └───────┬───────┘  │
                    │                                   consume      │          │
                    │   ┌────────────────┐             ┌────────────▼───────┐  │
                    │   │ Retry Dispatcher│             │     AI Worker      │  │
                    │   │  (+ Retention)  │             │  claim+lease, çıkar│  │
                    │   └────────────────┘             └────────┬───────────┘  │
                    │                                           │ /api/chat     │
                    │                                   ┌───────▼────────┐      │
                    │                                   │     Ollama     │      │
                    │                                   │ gemma3:4b-it.. │      │
                    │                                   └────────────────┘      │
                    └──────────────────────────────────────────────────────────┘

Dışarıya açık tek port: LLM API (127.0.0.1:8080).
Kafka / Worker / Ollama / (Redis) yalnızca iç ağdan erişilebilir.
```

**Akış:** İstemci → LLM API (`202`) → PostgreSQL (job + outbox tek transaction) →
Outbox Publisher → Kafka → AI Worker → Ollama → sonuç PostgreSQL'e yazılır →
istemci `GET /v1/jobs/{id}` ile sonucu alır.

---

## 2. Bileşenler

Hepsi **aynı Python kod tabanı / aynı Docker image**; yalnızca çalıştırma
komutları farklıdır:

| Bileşen | Komut | Görev |
|---|---|---|
| **LLM API** | `python -m app.entrypoints.api` | HTTP API; job + outbox yazar, model beklemez. |
| **AI Worker** | `python -m app.entrypoints.worker` | Kafka'dan okur, job'u sahiplenir (claim+lease), Ollama'yı çağırır, sonucu yazar. |
| **Outbox Publisher** | `python -m app.entrypoints.outbox_publisher` | Outbox kayıtlarını Kafka'ya yayınlar (at-least-once). |
| **Retry Dispatcher** | `python -m app.entrypoints.retry_dispatcher` | Süresi gelen RETRY job'larını yeniden kuyruğa alır; lease'i dolmuş işleri kurtarır; retention temizliğini yapar. |
| **Kafka (KRaft)** | — | Tek broker; iş kuyruğu + olay akışı. |
| **Ollama** | — | Model çalıştırıcı. Model: `gemma3:4b-it-q4_K_M`. |
| **PostgreSQL** | — | **Host makinede** çalışır (Docker değil). Ana ve güvenilir veri kaynağı. |

> **Redis** yalnızca ölçülmüş bir ihtiyaç olursa eklenir; bu sürümde yoktur.

---

## 3. Teknoloji Yığını

Python 3.12+, FastAPI, Uvicorn, Pydantic v2, PostgreSQL + SQLAlchemy 2.0 (async
Psycopg 3), Alembic, Apache Kafka (KRaft) + confluent-kafka, HTTPX, Ollama,
JSON Schema doğrulama, Prometheus metrikleri, Docker / Docker Compose. Testler:
Pytest + pytest-asyncio. Kalite: Ruff + mypy (strict). Tüm bağımlılıklar
`pyproject.toml` içinde **sabitlenmiştir (pinned)**.

---

## 4. Hızlı Başlangıç (1–10 adım)

1. **Python 3.12+** kurun. Depoyu açın: `cd ai-platform`.
2. **PostgreSQL'i host makinede** hazırlayın (bkz. [Bölüm 5](#5-postgresql-hazırlığı-host)).
3. Ortam dosyasını oluşturun: `.env.example` → `.env` kopyalayın ve değerleri doldurun (bkz. [Bölüm 6](#6-env-yapılandırması)).
4. (Docker'sız geliştirme için) sanal ortam + bağımlılıklar: `python -m venv .venv` sonra `pip install -e ".[dev]"`.
5. **Migration'ları** uygulayın: `alembic upgrade head` (bkz. [Bölüm 7](#7-migrationlar)).
6. **Docker Compose'u** başlatın: `docker compose up -d --build` (Kafka, Ollama, API, Worker, Publisher, Dispatcher). GPU için override ekleyin (bkz. [Bölüm 8](#8-docker-compose)).
7. İlk açılışta `ollama-model-init` modeli indirir; `kafka-init` topic'leri oluşturur. Bitmesini bekleyin (`docker compose ps`, healthcheck'ler `healthy` olmalı).
8. Bir **proje** ve **API anahtarı** oluşturun (bkz. [Bölüm 9](#9-proje-ve-api-anahtarı)).
9. **Job gönderin**: `POST /v1/jobs` → `202` + `jobId` (bkz. [Bölüm 10](#10-örnek-api-çağrıları)).
10. **Sonucu alın**: `GET /v1/jobs/{jobId}` → `status` `COMPLETED` olduğunda `result` döner.

---

## 5. PostgreSQL Hazırlığı (Host)

PostgreSQL **Docker içinde çalıştırılmaz**; host makinede kurulu olmalıdır.
Aşağıdaki script **tahribatsızdır** (idempotent): mevcut veritabanı/kullanıcıyı
**silmez**, yalnızca yoksa oluşturur ve asgari yetkileri verir.

```powershell
# Windows PowerShell (parola sorar; parola repoya YAZILMAZ)
./scripts/bootstrap_postgres.ps1 -SuperUser postgres -PgHost localhost -Port 5432
```

veya elle:

```bash
# Bir süper kullanıcı ile çalıştırın. Script yıkıcı (DROP) ifade içermez.
psql -U postgres -h localhost -f scripts/postgres_bootstrap.sql
```

Bu işlem şunları (yoksa) oluşturur:
- Rol: `ai_platform_user` (asgari yetkilerle).
- Veritabanları: `ai_platform` (uygulama) ve `ai_platform_test` (testler).

> Parolayı **siz** belirlersiniz; repoya yazılmaz. Kullanıcıya yalnızca gerekli
> asgari yetkiler verilir.

---

## 6. .env Yapılandırması

`.env` **gitignore'dadır**; gerçek parolalar repoya **yazılmaz**. Şablon:

```bash
cp .env.example .env     # Windows: Copy-Item .env.example .env
```

Önemli değişkenler:

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | Docker içinden: `postgresql+psycopg_async://ai_platform_user:<parola>@host.docker.internal:5432/ai_platform`. Docker dışından `localhost` kullanın. |
| `DATABASE_URL_TEST` | `ai_platform_test` veritabanını gösterir (integration/e2e testleri için). |
| `API_KEY_HMAC_SECRET` | API anahtarı secret'larının HMAC'i için gizli anahtar. **Güçlü ve gizli** olmalı. |
| `OLLAMA_HOST` / `OLLAMA_MODEL` | `http://ollama:11434` / `gemma3:4b-it-q4_K_M`. |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:9092`. |
| `MAX_CONCURRENT_INFERENCE` | Worker başına eşzamanlı inference (varsayılan `1`). |
| `PROJECT_MAX_ACTIVE_JOBS` / `PROJECT_MAX_PENDING_JOBS` / `GLOBAL_MAX_PENDING_JOBS` | Backpressure sınırları. |
| `RETRY_BACKOFF_SECONDS` | `10,60,300` — retry gecikme planı. |
| `RETENTION_DAYS` | Terminal job'ların hassas alanlarının temizlenme süresi. |

> Not: Spec `postgresql+psycopg_async://` şemasını kullanır; uygulama bunu
> SQLAlchemy'nin gerçek async sürücü adı olan `postgresql+psycopg://`'a otomatik
> normalize eder. İkisi de kabul edilir.

---

## 7. Migration'lar

```bash
# .env içindeki DATABASE_URL kullanılır (localhost ile, Docker dışından)
alembic upgrade head
```

Test veritabanı için:

```bash
# PowerShell
$env:DATABASE_URL="postgresql+psycopg://ai_platform_user:<parola>@localhost:5432/ai_platform_test"
alembic upgrade head
```

Migration beş tabloyu oluşturur: `projects`, `api_clients`, `jobs`,
`job_attempts`, `outbox` ve gerekli tüm indeks/kısıtları.

---

## 8. Docker Compose

```bash
docker compose up -d --build          # tüm servisler (Postgres HARİÇ — host'ta)
docker compose ps                     # healthcheck durumları
docker compose logs -f ai-worker      # logları izle
docker compose down                   # durdur
```

**GPU** (yalnızca Ollama için):

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d
```

- Yalnızca **LLM API** portu dışarıya açılır: `127.0.0.1:8080`.
- `kafka` KRaft modunda tek broker; `kafka-init` topic'leri oluşturur.
- `ollama-model-init` ilk açılışta modeli indirir.
- Container'lar host PostgreSQL'e `host.docker.internal` + `extra_hosts:
  "host.docker.internal:host-gateway"` ile erişir.
- Log rotasyonu (json-file, max-size/max-file) ve `mem_limit` tanımlıdır.

---

## 9. Proje ve API Anahtarı

API anahtarları PostgreSQL'de saklanır. Format: `key_id.secret`. **Secret asla
saklanmaz**; yalnızca HMAC-SHA256 hash'i tutulur ve tam anahtar **yalnızca bir
kez** gösterilir.

```bash
# Docker ile
docker compose run --rm llm-api python -m app.cli create-project --code heplin --name "Heplin"
docker compose run --rm llm-api python -m app.cli create-api-key --project heplin --name backend

# Docker dışından (venv aktifken)
python -m app.cli create-project --code heplin --name "Heplin"
python -m app.cli create-api-key --project heplin --name backend     # tam anahtarı BİR KEZ gösterir
python -m app.cli list-projects
python -m app.cli list-api-keys --project heplin
python -m app.cli disable-api-key --key-id <uuid>
python -m app.cli revoke-api-key --key-id <uuid>
python -m app.cli disable-project --code heplin
```

Proje kimliği **istek gövdesinden değil, yalnızca API anahtarından** belirlenir.
Devre dışı/iptal/süresi dolmuş anahtarlar reddedilir.

---

## 10. Örnek API Çağrıları

**Job oluştur** (zorunlu: `Authorization: Bearer <key>` ve `Idempotency-Key`):

```bash
curl -s -X POST http://localhost:8080/v1/jobs \
  -H "Authorization: Bearer <key_id>.<secret>" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
        "messages": [{"role": "user", "content": "Merhaba, kendini tanıt."}],
        "generation": {"temperature": 0.2, "maxOutputTokens": 256}
      }'
# → 202 { "jobId": "...", "status": "QUEUED", "createdAt": "...", "statusUrl": "/v1/jobs/..." }
```

**Yapılandırılmış çıktı** (JSON Schema):

```bash
-d '{
      "messages": [{"role":"user","content":"En kalabalık şehir?"}],
      "responseSchema": {"type":"object","properties":{"sehir":{"type":"string"}},"required":["sehir"]}
    }'
```

**Durum / sonuç sorgula:**

```bash
curl -s http://localhost:8080/v1/jobs/<jobId> -H "Authorization: Bearer <key>"
# status: QUEUED | RUNNING | RETRY | COMPLETED | FAILED | DEAD_LETTER
# COMPLETED ise: { "status":"COMPLETED", "result": {...}, "execution": {...} }
```

> Güvenlik: `GET` yanıtı **varsayılan olarak istek payload'unu (prompt) döndürmez**.
> Proje izolasyonu uygulanır: bir proje yalnızca kendi job'larını görebilir.

**Sağlık / metrik:**

```bash
curl http://localhost:8080/health/live     # süreç ayakta
curl http://localhost:8080/health/ready    # DB erişilebilir mi
curl http://localhost:8080/metrics         # Prometheus metrikleri
```

---

## 11. Kafka Topic'leri

| Topic | Amaç |
|---|---|
| `ai.jobs.requested.v1` | İşlenecek job istekleri (worker bunu tüketir). |
| `ai.jobs.events.v1` | Yaşam döngüsü olayları (completed/failed/retry). |
| `ai.jobs.dlq.v1` | Dead-letter: kalıcı/işlenemeyen mesajlar. |

Mesajlar **yalnızca metadata taşır** (jobId, projectId, attempt, correlationId …);
**prompt veya model cevabı Kafka'ya yazılmaz**. Anahtar (key) `jobId`'dir
(partition sıralaması). Offset **otomatik commit edilmez**; yalnızca mesaj
PostgreSQL'e güvenle işlendikten sonra, partition başına **sıralı (contiguous)**
commit edilir.

---

## 12. Job Durumları

```
QUEUED ──▶ RUNNING ──▶ COMPLETED
   ▲          │  │
   │          │  └──▶ FAILED            (kalıcı hata)
   │          ▼
   └──────── RETRY ──▶ (süre dolunca yeniden QUEUED)
              │
              └──▶ DEAD_LETTER          (gecici hata, max deneme aşıldı)
```

- **QUEUED**: oluşturuldu, işlenmeyi bekliyor.
- **RUNNING**: bir worker tarafından sahiplenildi (lease'li).
- **RETRY**: geçici hata; `next_retry_at` zamanında Retry Dispatcher yeniden kuyruğa alır.
- **COMPLETED** / **FAILED** / **DEAD_LETTER**: terminal durumlar.

---

## 13. Transactional Outbox

Job kaydı ve outbox kaydı **aynı veritabanı transaction'ında** yazılır; böylece
"DB'ye yazıldı ama Kafka'ya gitmedi" tutarsızlığı oluşmaz. Outbox Publisher,
bekleyen kayıtları `FOR UPDATE SKIP LOCKED` ile alır, Kafka'ya gönderir, broker
ack'ini bekler ve `PUBLISHED` işaretler. Başarısızlıkta **exponential backoff +
jitter** ile yeniden dener; maksimum denemeyi aşan kayıt `FAILED` olur (manuel
müdahale). Mesajlar yeniden yayınlanabilir; **consumer idempotenttir**.

---

## 14. Retry, Lease Kurtarma ve DLQ

- Geçici hatalar (Ollama bağlantı/timeout/503, DB/Kafka geçici, internal) **retry**
  edilir. Varsayılan plan: `10s, 60s, 5dk`, **en fazla 3 deneme**.
- Kalıcı hatalar (geçersiz istek, şema uyuşmazlığı, çıktı JSON değil …) retry
  **edilmez** → `FAILED`.
- Geçici hata + deneme bitti → `DEAD_LETTER` + `ai.jobs.dlq.v1`.
- **Lease kurtarma**: worker çökerse, lease süresi dolan `RUNNING` job'u Retry
  Dispatcher yeniden kuyruğa alır (veya max aşıldıysa DLQ). İş **kaybolmaz**.
- Aynı mesaj iki kez gelse bile job **idempotent** işlenir (terminal job'da model
  yeniden çağrılmaz; atomik `claim` çift işlemeyi önler).

---

## 15. Backpressure

Kapasite sınırları `.env` ile ayarlanır:
`PROJECT_MAX_ACTIVE_JOBS`, `PROJECT_MAX_PENDING_JOBS`, `GLOBAL_MAX_PENDING_JOBS`.
Sınır aşılırsa API **`429 Too Many Requests`** (proje) veya **`503`** (sistem)
döner ve `Retry-After` başlığı ekler. Worker tarafında Kafka tüketimi, iç kuyruk
dolunca **partition pause/resume** ile yavaşlatılır; uzun Ollama çağrısı poll
akışını durdurmaz.

---

## 16. Gözlemlenebilirlik

- **JSON yapılandırılmış loglar** + `correlation_id`. API isteğinde
  `X-Correlation-Id` üretilir/yayılır ve job boyunca taşınır.
- **Hassas veri loglanmaz**: API anahtarı, Authorization, prompt, mesaj içeriği,
  tam model cevabı ve PII maskelenir (ek güvenlik ağı: bilinen anahtarlar redakte
  edilir).
- **Prometheus metrikleri** her süreçte açıktır: API `GET /metrics`; diğer
  süreçler `METRICS_PORT` (varsayılan `9100`) üzerinde ayrı metrik sunucusu açar.
  Düşük cardinality (etiketler rota şablonu/proje ile sınırlı).

---

## 17. Retention / Temizlik

`RETENTION_DAYS > 0` ise Retry Dispatcher süreci içindeki Retention servisi,
belirtilen süreden eski **terminal** job'ların `request_payload` / `result` /
`response_schema` alanlarını **NULL yapar** (kayıt silinmez; metadata korunur) ve
`purged_at` işaretler.

---

## 18. Testler

```bash
# Tümü (unit + integration + e2e). Integration/e2e ai_platform_test gerektirir.
$env:DATABASE_URL="postgresql+psycopg://ai_platform_user:<parola>@localhost:5432/ai_platform_test"
$env:API_KEY_HMAC_SECRET="test-secret"
pytest

pytest tests/unit                 # yalnızca birim testleri (DB gerektirmez)
pytest -m integration             # PostgreSQL gerektirir
pytest -m e2e                     # uçtan uca akış (mock Ollama + FakeProducer)
```

- **Mock Ollama**: `tests/mock_ollama.py` — ayarlanabilir gecikme/hata/çıktı ile
  gerçek Ollama'yı taklit eden HTTP servisi (gerçek model/GPU gerektirmez).
- Integration/e2e testleri ayrı **`ai_platform_test`** veritabanını kullanır;
  her testten önce tablolar temizlenir. PostgreSQL erişilemezse bu testler atlanır.
- Kapsanan senaryolar: auth, idempotency, proje izolasyonu, backpressure (429),
  atomik claim (eşzamanlılık), worker başarı/şema/geçersiz-çıktı/timeout→retry/
  DLQ/çift-teslim/lease-kurtarma, outbox yayın-replay, retry dispatcher, uçtan uca.

### Gerçek Ollama smoke testi

```bash
$env:OLLAMA_SMOKE_HOST="http://localhost:11434"
pytest -m smoke
```

---

## 19. Yük Testi (Locust)

```powershell
$env:LOADTEST_API_KEY = "<key_id>.<secret>"
./loadtest/run_scenarios.ps1 -Host "http://localhost:8080" -RunTime 1m
# Linux/macOS: ./loadtest/run_scenarios.sh http://localhost:8080 1m
```

10 parametreli senaryo (smoke, baseline, ramp 50/100, spike 200, büyük prompt,
yapılandırılmış çıktı, create-only, poll-heavy, sürekli stres) çalışır ve
`loadtest/reports/` altına HTML + CSV rapor yazar (dizin gitignore'dadır). Tek
senaryo için doğrudan `locust -f loadtest/locustfile.py ...` kullanılabilir.

---

## 20. Performans Ayarları

- **Model tek ve sabit**: `gemma3:4b-it-q4_K_M`. `OLLAMA_KEEP_ALIVE` ile model
  bellekte tutulur (soğuk başlatma maliyetini azaltır); `warmup` ile ısıtılabilir.
- **GPU** varsa `docker-compose.gpu.yml` ile Ollama'ya atanır — en büyük hız kazancı.
- **Worker ölçekleme**: `ai-worker`'ı çoğaltın (`docker compose up --scale
  ai-worker=N`). `MAX_CONCURRENT_INFERENCE` tek GPU'da genelde `1` bırakılmalıdır.
- **DB havuzu**: `DB_POOL_SIZE` / `DB_MAX_OVERFLOW` yük profiline göre ayarlanır.
  Transaction'lar kısadır; Ollama çağrısı boyunca DB transaction'ı **açık tutulmaz**.
- **Kafka**: partition sayısını (`KAFKA_TOPIC_PARTITIONS`) worker paralelliğine göre
  artırın.

---

## 21. Güvenlik Notları

- Gerçek parolalar **repoya yazılmaz**; `.env` gitignore'dadır, `.env.example`
  yalnızca güvenli yer tutucular içerir.
- Docker Compose'a gerçek secret yazılmaz (değerler `.env`'den `env_file` ile gelir).
- PostgreSQL bootstrap script'i **tahribatsızdır** (DROP yoktur) ve DB kullanıcısına
  **asgari yetki** verir. Otomatik/izinsiz yönetici işlemi çalıştırılmaz.
- API anahtarı secret'ları saklanmaz (HMAC hash); loglarda hassas veri maskelenir.

---

## 22. Üretim Önerileri ve Bilinen Kısıtlar

- **Tek sunucu / tek Kafka broker = Yüksek Erişilebilirlik (HA) YOKTUR.** Bu
  kurulum tek bir makine/broker için tasarlanmıştır; broker veya host çökerse
  kesinti olur. Üretimde HA için: çok broker'lı Kafka (replication factor ≥ 3),
  PostgreSQL replikasyonu/yedekleme, birden çok worker ve API örneği, bir yük
  dengeleyici ve harici izleme (Prometheus/Grafana + alerting) önerilir.
- Ollama tek örnektir; yüksek throughput için GPU + birden çok worker + (gerekirse)
  birden çok Ollama örneği düşünülmelidir.
- Redis yoktur; backpressure ve sayaçlar PostgreSQL üzerinden yürür. Ölçülen bir
  ihtiyaç doğarsa Redis eklenebilir.
- DLQ'ya düşen mesajlar için manuel inceleme/yeniden işleme süreci kurulmalıdır.

---

## 23. Lisans / Sahiplik

Kurum içi servis. `ai-platform/` klasörü bağımsızdır ve depodaki diğer projeleri
etkilemez.
