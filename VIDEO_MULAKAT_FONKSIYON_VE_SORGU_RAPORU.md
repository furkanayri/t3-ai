# Video Mülakat Sürecinde Çalışan Fonksiyonlar ve Veritabanı Sorguları

Bu rapor, mevcut kodda adayın mülakata girişinden video cevaplarının Cloudflare R2’ye yüklenmesine ve mülakatın tamamlanmasına kadar çalışan fonksiyonları ve veritabanı işlemlerini içerir. AI değerlendirme ve transkripsiyon kapsam dışındadır.

Sorgular, Mongoose çağrılarının okunabilir karşılıklarıdır. Kimlik alanları ilgili isteğin parametrelerini temsil eder. Kodda `BaseSchema` ile etkinleştirilen timestamps nedeniyle Mongoose güncellemelerde `updatedAt` alanını da yönetir; aşağıdaki örneklerde iş alanları gösterilmiştir.

## 1. Her API İsteğinde Çalışan Ortak Fonksiyonlar

Doğrudan R2’ye yapılan PUT dışında, aşağıdaki aday API endpoint’lerinde ortak kontroller çalışır.

| Sıra | Fonksiyon | İşlem |
|---|---|---|
| 1 | `rateLimiterMiddleware` | Redis üzerinden IP bazlı istek sınırını kontrol eder |
| 2 | `executeNodes` | Route fonksiyonlarını sırayla çalıştırır |
| 3 | `authenticate` | Token’ı alır ve kimlik doğrulamasını yapar |
| 4 | `verifyToken` | JWT imzasını ve geçerliliğini kontrol eder |
| 5 | `generateHash` | Redis anahtarı için token hash’i üretir |
| 6 | `redisClient.exists` | Token’ın Redis’te bulunduğunu kontrol eder |
| 7 | `users.findOne` | Kullanıcıyı MongoDB’den getirir |
| 8 | Endpoint fonksiyonu | İsteğe özel işlemleri gerçekleştirir |

Redis token sorgusu:

```text
EXISTS token:{hashToken}&userId:{decoded.sub}
```

Rate limiter ayrıca kendi Redis işlemlerini `koa-ratelimit` kütüphanesi üzerinden yürütür.

MongoDB sorgusu:

```javascript
Users.findOne({
  _id: decoded.sub,
  isDeleted: false
});
```

`isDeleted: false` filtresi `BaseService.findOne()` tarafından eklenir.

Kaynaklar:

- `backend/middlewares/rateLimiter.ts`
- `backend/middlewares/executeNodes.ts`
- `backend/functions/shared/authenticate.ts`
- `backend/utils/generateOauthHelpers.ts`
- `backend/utils/BaseService.ts`

## 2. Mülakat Listesinin Getirilmesi

```http
GET /api/v1/candidateInterview
```

Fonksiyon zinciri:

```text
InterviewProvider
→ useGetAllCandidateInterviewQuery
→ getAllCandidateInterview [frontend servis]
→ getAllCandidateInterview [backend]
→ candidateInterview.findAll
→ BaseService.findAll
→ ApiFeatures.execute
```

MongoDB sorguları:

```javascript
CandidateInterview.find({
  userId: ctx.state.user._id,
  isDeleted: false
})
  .sort({ createdAt: -1 })
  .select("-__v")
  .skip(0)
  .limit(0);

CandidateInterview.countDocuments({
  userId: ctx.state.user._id,
  isDeleted: false
});
```

Ortak kullanıcı sorgusu dahil 3 MongoDB işlemi gerçekleşir.

Kaynaklar:

- `backend/functions/candidateInterview/getAllCandidateInterview.ts`
- `backend/utils/ApiFeatures.ts`

## 3. Mülakat Detayının Getirilmesi

```http
GET /api/v1/candidateInterview/:interviewId
```

Fonksiyon zinciri:

```text
InterviewProvider
→ useGetOneCandidateInterviewQuery
→ getOneCandidateInterview [frontend servis]
→ getOneCandidateInterview [backend]
→ candidateInterview.findById
→ BaseService.findById
```

MongoDB sorgusu:

```javascript
CandidateInterview.findById(interviewId);
```

Mülakat durumu, `questionIndex`, `candidateAnswersId`, `interviewId` ve tarih alanları bu belgeden alınır. Ortak kullanıcı sorgusu dahil 2 MongoDB işlemi gerçekleşir.

Kaynak: `backend/functions/candidateInterview/getOneCandidateInterview.ts`.

## 4. Mülakat Sorularının Getirilmesi

```http
GET /api/v1/candidateInterviewQuestion/:interviewId
```

Buradaki `interviewId`, aday mülakat belgesinin `_id` değeri değil, içindeki `interviewId` alanıdır.

Fonksiyon zinciri:

```text
InterviewProvider
→ useGetCandidateInterviewQuestion
→ getInterviewQuestion
→ getCandidateInterviewQuestion [backend]
→ interviewQuestions.findOne
→ BaseService.findOne
```

MongoDB sorgusu:

```javascript
InterviewQuestions.findOne({
  interviewId: ctx.params.interviewId,
  isDeleted: false
});
```

Soru metinleri, süreler ve varsa soru ses dosyalarının anahtarları alınır. Ortak kullanıcı sorgusu dahil 2 MongoDB işlemi gerçekleşir.

Kaynak: `backend/functions/candidateInterview/getCandidateInterviewQuestion.ts`.

## 5. Mevcut Cevapların Getirilmesi

```http
GET /api/v1/candidateAnswers/:candidateAnswerId
```

Fonksiyon zinciri:

```text
InterviewProvider
→ useGetOneCandidateAnswerQuery
→ getOneCandidateAnswer
→ getOneCandidateAnswers [backend]
→ candidateInterviewAnswers.findById
→ BaseService.findById
```

MongoDB sorgusu:

```javascript
CandidateAnswers.findById(candidateAnswerId);
```

Kimlik, aday mülakat belgesindeki `candidateAnswersId` alanından alınır. Ortak kullanıcı sorgusu dahil 2 MongoDB işlemi gerçekleşir.

Kaynak: `backend/functions/candidateAnswers/getCandidateAnswers.ts`.

## 6. Mülakatın Başlatılması

```http
PATCH /api/v1/candidateInterview/:interviewId
```

Fonksiyon zinciri:

```text
InterviewDetail.handleStartInterview
→ useCandidateInterviewUpdateMutation
→ updateCandidateInterview
→ updateAllCandidateInterview [backend]
→ candidateInterview.update
→ BaseService.update
```

MongoDB işlemi:

```javascript
CandidateInterview.findByIdAndUpdate(
  interviewId,
  {
    isStart: true,
    startDate,
    status: "started"
  },
  { new: true }
);
```

`startDate`, frontend’de `new Date()` ile oluşturulur. İstek tamamlandıktan sonra cevap ekranına yönlendirme yapılır. Ortak kullanıcı sorgusu dahil 2 MongoDB işlemi gerçekleşir.

Kaynaklar:

- `frontend/src/pages/AccountsApp/Interviews/CinterviewDetail/InterviewDetail.tsx`
- `backend/functions/candidateInterview/updateCandidateInterview.ts`

## 7. Tarayıcıda Video Kaydı

Bu aşama doğrudan MongoDB veya Redis sorgusu gerçekleştirmez.

| Fonksiyon / callback | İşlem |
|---|---|
| `VideoSave.startCamera` | Kamera ve mikrofon erişimini başlatır |
| `navigator.mediaDevices.getUserMedia` | Medya akışını oluşturur |
| `new MediaRecorder` | Kayıt nesnesini oluşturur |
| `startRecording` | `MediaRecorder.start()` çağırır |
| `ondataavailable` | Kayıt verisini `chunks.current` dizisine ekler |
| `stopRecording` | `MediaRecorder.stop()` çağırır |
| `onstop` | Blob oluşturur ve `videoBlob` state’ine yazar |
| `stopCamera` | Medya track’lerini durdurur ve kamera state’lerini temizler |

Kaynak: `frontend/src/pages/AccountsApp/Answer/components/VideoSave.tsx`.

## 8. R2 Yükleme URL’sinin Oluşturulması

```http
POST /api/v1/upload/generate-presigned-url
```

Fonksiyon zinciri:

```text
VideoSave.handleSave
→ useVideoUpload.uploadVideo
→ useGeneratePresignedUrlMutation
→ generatePresignedUrlService
→ generatePresignedUrl [backend]
→ generateFileKey
→ s3Client.getSignedUrlPromise("putObject")
```

İstek verileri:

```javascript
{
  fileName: `${question._id}.webm`,
  contentType: videoBlob.type || "video/webm",
  questionId: question._id
}
```

İmzalı URL işlemi:

```javascript
s3Client.getSignedUrlPromise("putObject", {
  Bucket: process.env.AWS_BUCKET_PRIVATE,
  Key: fileKey,
  Expires: 600
});
```

Endpoint’in kendi içinde MongoDB yazımı veya soru sorgusu yoktur. Ortak kimlik doğrulaması nedeniyle 1 MongoDB kullanıcı sorgusu gerçekleşir. R2 akışında `LOCAL_UPLOAD_DIR` seçeneği etkin değildir.

Kaynak: `backend/functions/upload/generatePresignedUrl.ts`.

## 9. Videonun R2’ye Gönderilmesi

Fonksiyon zinciri:

```text
useVideoUpload.uploadVideo
→ fetch(presignedUrl)
```

İşlem:

```javascript
fetch(presignedUrl, {
  method: "PUT",
  body: videoBlob
});
```

Video tarayıcıdan doğrudan R2’ye gönderilir. Bu PUT sırasında backend endpoint’i, MongoDB sorgusu veya uygulamanın Redis kimlik doğrulaması çalışmaz. Başarılı HTTP yanıtından sonra `uploadVideo`, `fileKey` döndürür.

Kaynak: `frontend/src/hooks/useVideoUpload.tsx`.

## 10. Video Cevabının Veritabanına Kaydedilmesi

```http
PATCH /api/v1/candidateVideoAnswers/:candidateAnswerId
```

Fonksiyon zinciri:

```text
VideoSave.handleSave
→ useCandidateVideoAnswersUpdateMutation
→ updateCandidateVideoAnswer
→ updateCandidateVideoAnswers [backend]
```

İstek verileri:

```javascript
{
  fileKey,
  question: question.question,
  questionId: question._id,
  questionIndex: activeStep + 1,
  responseTime: 0
}
```

### 10.1. Soru İlerlemesinin Güncellenmesi

`questionIndex` değeri truthy ise aşağıdaki işlem çalışır:

```text
candidateInterview.updateOne
→ BaseService.updateOne
→ findOneAndUpdate
```

```javascript
CandidateInterview.findOneAndUpdate(
  { candidateAnswersId: candidateAnswerId },
  { questionIndex },
  { new: true }
);
```

### 10.2. Cevap Dizisine Video Kaydının Eklenmesi

İlerleme işlemi beklendikten sonra:

```text
candidateInterviewAnswers.updateOne
→ BaseService.updateOne
→ findOneAndUpdate
```

```javascript
CandidateAnswers.findOneAndUpdate(
  { _id: candidateAnswerId },
  {
    $push: {
      interiewAnswers: {
        fileKey,
        responseTime: responseTime || 0,
        question,
        questionId
      }
    }
  },
  { new: true }
);
```

`interiewAnswers`, modelde kullanılan gerçek alan adıdır. Normal frontend gönderiminde ortak kullanıcı sorgusu dahil 3 MongoDB işlemi gerçekleşir: kullanıcı okuma, ilerleme güncelleme ve cevap ekleme.

Kaynak: `backend/functions/candidateAnswers/updateCandidateVideoAnswers.ts`.

## 11. Görünürlük Olaylarının Kaydedilmesi

```http
PATCH /api/v1/candidateInterview/:interviewId/interviewlogs
```

Fonksiyon zinciri:

```text
usePageVisibility
→ VideoSave içindeki useEffect
→ useCandidateInterviewUpdateLogsMutation
→ updateCandidateInterviewLogs
→ interviewLogs [backend]
→ candidateInterview.updateOne
```

Görünürlük state’i `true` olduğunda log gönderilir. Sayfanın başlangıçta görünür olması da effect’in çalışmasına neden olabilir.

MongoDB işlemi:

```javascript
CandidateInterview.findOneAndUpdate(
  { _id: interviewId },
  {
    $push: {
      eventLogs: {
        eventType: "tabChange",
        questionId
      }
    }
  },
  { new: true }
);
```

Ortak kullanıcı sorgusu dahil 2 MongoDB işlemi gerçekleşir.

Kaynaklar:

- `frontend/src/pages/AccountsApp/Interviews/hooks/usePageVisibility.tsx`
- `backend/functions/candidateInterview/interviewLogs.ts`

## 12. Mülakatın Tamamlanması

Son soru cevabının kaydedilmesinden sonra:

```text
VideoSave onSuccess
→ onConfirm
→ VideoInterview.handleModalConfirm
→ useCandidateInterviewUpdateMutation
→ updateCandidateInterview
→ updateAllCandidateInterview [backend]
→ candidateInterview.update
```

```http
PATCH /api/v1/candidateInterview/:interviewId
```

MongoDB işlemi:

```javascript
CandidateInterview.findByIdAndUpdate(
  interviewId,
  {
    accessLocked: true,
    status: "completed"
  },
  { new: true }
);
```

Ortak kullanıcı sorgusu dahil 2 MongoDB işlemi gerçekleşir.

Frontend, completion isteğini beklemeden şu çağrıları da yapar:

```javascript
route.push("/interviews");
interviewQuery.refetch();
```

`interviewQuery.refetch()` mülakat detay endpoint’ini yeniden çağırır. Bu isteğin kendi kullanıcı ve mülakat okuma sorguları vardır.

Kaynak: `frontend/src/pages/AccountsApp/Answer/section/VideoInterview.tsx`.

## 13. Süresi Dolmuş Mülakatın Durum Güncellemesi

Liste ekranında mülakat detayına giriş sırasında, son geçerlilik tarihi geçmişse `handleInterviewDetail` şu güncellemeyi gönderir:

```http
PATCH /api/v1/candidateInterview/:interviewId
```

```javascript
CandidateInterview.findByIdAndUpdate(
  interviewId,
  {
    accessLocked: true,
    status: "expired"
  },
  { new: true }
);
```

Başarılı güncelleme callback’i `candidateInterviewQuery.refetch()` ile liste sorgusunu yeniden başlatır.

Kaynak: `frontend/src/pages/AccountsApp/Interviews/components/Interviews.tsx`.

## 14. Kullanılan Modeller ve Ortak Servisler

| Model / servis | Süreçteki kullanım | Kaynak |
|---|---|---|
| `Users` / `users` | Her korumalı API isteğinde kullanıcı okuma | `backend/models/Users.model.ts` |
| `CandidateInterview` / `candidateInterview` | Liste, detay, başlangıç, ilerleme, log ve tamamlanma | `backend/models/CandidateInterview.model.ts` |
| `InterviewQuestions` / `interviewQuestions` | Soru setini getirme | `backend/models/InterviewQuestions.model.ts` |
| `CandidateAnswers` / `candidateInterviewAnswers` | Cevapları getirme ve video fileKey ekleme | `backend/models/CandidateAnswers.model.ts` |
| `BaseService` | Ortak Mongoose sorgularını çalıştırma | `backend/utils/BaseService.ts` |
| `ApiFeatures` | Liste filtreleme, sıralama, pagination ve count | `backend/utils/ApiFeatures.ts` |

Frontend servis ve hook tanımları:

- `frontend/src/services/interviewServices.ts`
- `frontend/src/hooks/useServices/useInterviewServices.ts`
- `frontend/src/pages/AccountsApp/Interviews/InterviewContext/InterviewProvider.tsx`

Route tanımları: `backend/routes.ts`.

## 15. İşlem Sayıları Özeti

Aşağıdaki sayılar başarılı isteklerde ortak kullanıcı sorgusunu içerir. `findOneAndUpdate` ve `findByIdAndUpdate`, bu tabloda birer yazma işlemi olarak sayılmıştır. Liste count sorgusu okuma olarak sayılmıştır. Refetch ve görünürlük olayları ayrıca çağrıldıkları kadar işlem üretir.

| İşlem | MongoDB okuma | MongoDB yazma | Redis kullanımı |
|---|---:|---:|---|
| Mülakat listesini getir | 3 | 0 | Rate limit + token kontrolü |
| Mülakat detayını getir | 2 | 0 | Rate limit + token kontrolü |
| Soruları getir | 2 | 0 | Rate limit + token kontrolü |
| Mevcut cevapları getir | 2 | 0 | Rate limit + token kontrolü |
| Mülakatı başlat | 1 | 1 | Rate limit + token kontrolü |
| R2 yükleme URL’si üret | 1 | 0 | Rate limit + token kontrolü |
| Videoyu doğrudan R2’ye yükle | 0 | 0 | Yok |
| Video cevabını kaydet | 1 | 2 | Rate limit + token kontrolü |
| Görünürlük olayını kaydet | 1 | 1 | Rate limit + token kontrolü |
| Mülakatı tamamla | 1 | 1 | Rate limit + token kontrolü |
| Mülakatı expired olarak güncelle | 1 | 1 | Rate limit + token kontrolü |

Her soru için normal **URL üretme → R2 PUT → cevap kaydetme** zinciri toplam **2 MongoDB okuması ve 2 MongoDB yazma işlemi** gerçekleştirir. Görünürlük logları, sayfa sorguları ve başlangıç/bitiş işlemleri bu toplama dahil değildir.
