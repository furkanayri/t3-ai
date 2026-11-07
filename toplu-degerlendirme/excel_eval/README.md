# Excel Toplu Değerlendirme (ai-platform)

Excel'deki başvuru yanıtlarını `ai-platform`'un HTTP API'si üzerinden LLM ile
değerlendirip sonuçları yeni bir Excel dosyasına yazar.

**ai-platform'un yapısı değiştirilmez** — yalnızca genel API kullanılır
(`POST /v1/jobs`, `GET /v1/jobs/{id}`).

## Nasıl çalışır

1. `Kriterler` sayfasından sorular ve puanlama rubriği okunur.
2. `Başvurular` sayfasından her aday için cevaplar okunur.
3. Aday başına **tek bir iş** gönderilir (3 soru birlikte, `responseSchema` ile
   yapılandırılmış çıktı).
4. Puanlar deterministik atanır:
   - Kategori bazlı sorular (dron kullanımı, eğitmenlik deneyimi): model kategoriyi
     seçer, puan rubrikteki sabit değerden atanır.
   - Aralık bazlı sorular (motivasyon yazısı): model 0-10 arası tam sayı puan verir.
5. Sonuçlar `Değerlendirme Sonuçları.xlsx` dosyasına yazılır.

## Kurulum

```powershell
cd C:\Users\frkna\PycharmProjects\t3-ai\toplu-degerlendirme
pip install -r excel_eval\requirements.txt
```

## Ön koşul: ai-platform ayakta ve bir API anahtarı

ai-platform stack çalışır durumda olmalı (varsayılan `http://localhost:8080`).
Değerlendirme için bir proje ve API anahtarı üretin (ai-platform klasöründe):

```powershell
cd ..\ai-platform
python -m app.cli create-project --code heplin --name "Heplin"
python -m app.cli create-api-key --project heplin --name excel-eval
# Ciktidaki "API KEY" degerini kopyalayin (yalnizca bir kez gosterilir).
```

Anahtarı ortam değişkenine koyun:

```powershell
$env:AI_PLATFORM_API_KEY = "<API KEY>"
$env:AI_PLATFORM_BASE_URL = "http://localhost:8080"   # varsayilan
```

## Çalıştırma

```powershell
cd C:\Users\frkna\PycharmProjects\t3-ai\toplu-degerlendirme

# Önce küçük bir doğrulama turu (ilk 5 başvuru):
python -m excel_eval.evaluate_excel --limit 5

# Tüm başvurular:
python -m excel_eval.evaluate_excel
```

### Önemli argümanlar

| Argüman | Varsayılan | Açıklama |
| --- | --- | --- |
| `--excel` | repo kökündeki Excel | Girdi dosyası |
| `--out` | `Değerlendirme Sonuçları.xlsx` | Çıktı dosyası |
| `--limit N` | `0` (tümü) | Yalnızca ilk N başvuru |
| `--concurrency N` | `2` | Eş zamanlı iş sayısı. Bu makinede Ollama ve worker da 2 paralel çalışır. |
| `--poll-interval` | `2.0` sn | İş durumu sorgulama aralığı |
| `--job-timeout` | `1800` sn | Tek iş için üst bekleme süresi |
| `--checkpoint` | çıktı yanında `.checkpoint.jsonl` | İlerleme kaydı |

## Devam ettirme (resume)

Her tamamlanan değerlendirme `.checkpoint.jsonl` dosyasına yazılır. Komut
yeniden çalıştırıldığında başarıyla (`OK`) tamamlanan başvurular atlanır, böylece
kesilen bir koşu kaldığı yerden devam eder. `Idempotency-Key = excel-eval:v2:<id>`
olduğundan aynı başvuru için ai-platform'da mükerrer iş oluşmaz.

## Ölçek notu

Ollama bu makinede aynı anda 2 istek işler (`OLLAMA_NUM_PARALLEL=2`). Binlerce
başvuruda tam tur saatler sürebilir — önce `--limit` ile doğrulayın, ardından
tam turu başlatın. Koşu kesilse de checkpoint sayesinde devam edilebilir.
Cevaplar kısaltılmaz; Excel’deki metin olduğu gibi gönderilir.
