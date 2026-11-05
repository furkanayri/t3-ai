# Yerel Toplu Video Değerlendirme

Bu worker, yerel SQS kuyruğundan tek bir video işi alır, Faster Whisper ile
Türkçe transkript üretir, `gemma3:4b` ile değerlendirir ve sonucu yerel
MongoDB'deki `processed_interviews` koleksiyonuna yazar.

Üretim AWS, R2, OpenAI ve Gemini servisleri yerel akışta kullanılmaz.

## Hızlı başlangıç

Önce backend yerel MongoDB container'ının çalıştığından emin olun:

```powershell
cd ..\backend
npm run infra:local
```

Ardından batch altyapısını başlatın ve mevcut videoları listeleyin:

```powershell
cd ..\toplu-degerlendirme
npm run infra:local
npm run jobs:list:local
```

Listeden bir `answerId` seçip yalnızca o videoyu kuyruğa ekleyin:

```powershell
npm run jobs:push:local -- --answer-id <answerId>
npm run worker:local
```

İlk çalıştırmada Docker image, Whisper modeli ve Gemma 3 4B indirileceği için
işlem uzun sürebilir. Ayrıntılar için `LOCAL_DEVELOPMENT.md` dosyasına bakın.
