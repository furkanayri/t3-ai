# Yerel batch değerlendirme rehberi

## Bileşenler

- MongoDB: `backend/docker-compose.local.yml`, `127.0.0.1:27018`
- LocalStack SQS: `127.0.0.1:4566`
- Video kaynağı: `backend/.local-uploads` (worker içinde salt-okunur)
- Transkript: Faster Whisper `large-v3`, CUDA `int8_float16`
- Değerlendirme: Ollama `gemma3:4b`
- Sonuç: `heplin-local.processed_interviews`

> Not: Compose, kimlik doğrulama anahtarı istemeyen LocalStack Community
> `3.8.1` imajını kullanır. Denenen `2026.10.4` imajı auth token olmadan
> başlamadığı için tamamen yerel ve anahtarsız geliştirme hedefiyle uyumlu
> Community sürümüne sabitlenmiştir.

## Komutlar

```powershell
# Yerel SQS'yi başlat
npm run infra:local

# MongoDB'de video cevabı bulunan kayıtları listele
npm run jobs:list:local

# Mesajı göndermeden payload'ı doğrula
npm run jobs:push:local -- --answer-id <answerId> --dry-run

# Yalnızca seçilen cevabı kuyruğa gönder
npm run jobs:push:local -- --answer-id <answerId>

# Worker image'ını oluştur ve tek işi çalıştır
npm run worker:local

# Logları izle
npm run logs:local

# LocalStack ve worker container'larını durdur
npm run down:local
```

Başarılı sonuç daha önce işlendiğinde pusher işi tekrar kuyruğa eklemez. Testi
bilinçli olarak tekrarlamak için `--force` kullanılabilir. Filtre verilmeden tüm
videoların kuyruğa gönderilmesi güvenlik amacıyla desteklenmez.

## Sonuç doğrulama

MongoDB'deki belge aşağıdaki temel alanları içermelidir:

```json
{
  "status": "SUCCESS",
  "transcript": "...",
  "evaluationScore": 0,
  "evaluationReasoning": "...",
  "modelVersions": {
    "whisper": "large-v3",
    "llm": "gemma3:4b"
  }
}
```

Aynı `candidateAnswerId + answerId` çifti yeniden işlendiğinde yeni belge
oluşturulmaz; mevcut belge güncellenir.

## Güvenlik

`.env.local` yalnızca sahte yerel AWS değerleri içerir ve Git tarafından yok
sayılır. Geçmişte repoya yazılmış gerçek erişim anahtarları kullanılmamalı;
ilgili sağlayıcılarda iptal edilip yenilenmelidir.
# 150 videoluk yerel karşılaştırma

İndirilen eski videoları tarihsel `gemma3:12b` puanlarıyla karşılaştırmak için işlemleri
`toplu-degerlendirme` klasöründe çalıştırın. Tarihsel `processed_interviews` belgeleri bu
akışta değiştirilmez; yeni sonuçlar yalnızca ignore edilen `.local-runs` klasörüne yazılır.

```powershell
npm install
npm run compare:prepare:local -- --source "C:\Users\frkna\Downloads\R2-YEDEK-20261102T084357Z-1-001"
npm run compare:local
```

Hazırlık varsayılan olarak 150 videoyu 24 soru ve dört eski puan bandı arasında dengeli
seçer, videoları FFmpeg ile decode eder ve SHA-256 değerlerini kaydeder. Varsayılan seed
`20261102` değeridir. Üç videoluk bir altyapı testi için `--sample-size 3` kullanılabilir.

Canlı dashboard yalnızca bu bilgisayardan erişilebilir:

- Ana adres: http://localhost:4180
- Koşu adresi: `http://localhost:4180/runs/<run-id>`

Yarım kalan koşuyu sürdürmek ve raporu yeniden üretmek için:

```powershell
npm run compare:resume:local -- --run-id <run-id>
npm run compare:status:local -- --run-id <run-id>
npm run compare:report:local -- --run-id <run-id>
npm run compare:dashboard:local
npm run compare:down:local
```

Dashboard worker tamamlandıktan sonra açık kalır. Kapatma komutu yalnızca dashboard'u
durdurur; yerel MongoDB'deki eski sonuçları veya `.local-runs` çıktısını silmez.

