# 📚 Quiz Sistemi - Tam Dokümantasyon

## 🗂️ Model Yapısı

### 1. QuizQuestions.model.ts
**Dosya:** `models/QuizQuestions.model.ts`  
**Amaç:** Soru havuzu yönetimi

```typescript
{
  _id: ObjectId,
  tenantId: ObjectId,
  categoryId?: ObjectId,
  title: string,
  description?: string,
  question: string,
  options: [
    {
      optionId: string,
      text: string,
      isCorrect: boolean
    }
  ],
  difficulty: 'easy' | 'medium' | 'hard',
  timeLimit?: number,
  points: number,
  tags?: string[],
  isActive: boolean,
  explanation?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. QuizSets.model.ts
**Dosya:** `models/QuizSets.model.ts`  
**Amaç:** Quiz test paketleri oluşturma

```typescript
{
  _id: ObjectId,
  tenantId: ObjectId,
  categoryId?: ObjectId,
  title: string,
  description?: string,
  instructions?: string,
  questionIds: ObjectId[], // QuizQuestions referansları
  totalQuestions: number,
  totalPoints: number,
  timeLimit?: number,
  passingScore?: number,
  difficulty: 'easy' | 'medium' | 'hard',
  tags?: string[],
  isActive: boolean,
  shuffleQuestions?: boolean,
  shuffleOptions?: boolean,
  allowRetake?: boolean,
  maxAttempts?: number,
  showResults?: 'immediately' | 'after_completion' | 'manual',
  createdAt: Date,
  updatedAt: Date
}
```

### 3. UserQuizAssignments.model.ts
**Dosya:** `models/UserQuizAssignments.model.ts`  
**Amaç:** Kullanıcılara quiz atama yönetimi

```typescript
{
  _id: ObjectId,
  userId: ObjectId, // ref: users
  quizSetId: ObjectId, // ref: quizsets
  tenantId: ObjectId,
  assignedBy: ObjectId, // ref: users
  assignedAt: Date,
  dueDate?: Date,
  startedAt?: Date,
  completedAt?: Date,
  status: 'assigned' | 'started' | 'completed' | 'overdue' | 'cancelled',
  attempts: number,
  lastAttemptAt?: Date,
  bestScore?: number,
  bestScorePercentage?: number,
  notes?: string,
  priority: 'low' | 'medium' | 'high',
  createdAt: Date,
  updatedAt: Date
}
```

### 4. QuizSessions.model.ts
**Dosya:** `models/QuizSessions.model.ts`  
**Amaç:** Quiz oturumu ve sonuç takibi

```typescript
{
  _id: ObjectId,
  userId: ObjectId, // ref: users
  quizSetId: ObjectId, // ref: quizsets
  assignmentId: ObjectId, // ref: userquizassignments
  tenantId: ObjectId,
  sessionId: string, // unique
  attemptNumber: number,
  totalQuestions: number,
  answeredQuestions: number,
  correctAnswers: number,
  totalPoints: number,
  maxPossiblePoints: number,
  scorePercentage: number,
  totalTimeSpent: number, // saniye
  timeLimit?: number, // saniye
  status: 'active' | 'completed' | 'abandoned' | 'timeout',
  startedAt: Date,
  completedAt?: Date,
  isPassed?: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. UserQuizAnswers.model.ts
**Dosya:** `models/UserQuizAnswers.model.ts`  
**Amaç:** Kullanıcı cevapları ve detay takibi

```typescript
{
  _id: ObjectId,
  userId: ObjectId, // ref: users
  questionId: ObjectId, // ref: quizquestions
  tenantId: ObjectId,
  quizSessionId?: string,
  selectedOptionId: string,
  isCorrect: boolean,
  timeSpent: number, // saniye
  earnedPoints: number,
  answeredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 Model İlişkileri

```
QuizQuestions (Soru Havuzu)
    ↓
    | questionIds referansı
    ↓
QuizSets (Test Paketi)
    ↓
    | quizSetId referansı
    ↓
UserQuizAssignments (Atama)
    ← userId (Users)
    ← assignedBy (Users)
    ↓
    | assignmentId referansı
    ↓
QuizSessions (Oturum)
    ← userId (Users)
    ↓
    | quizSessionId referansı
    ↓
UserQuizAnswers (Cevaplar)
    ← questionId (QuizQuestions)
    ← userId (Users)
```

---

## 📡 API Endpoint'leri

### 🔵 QuizQuestions API
**Klasör:** `functions/quizQuestions/`

| Method | Endpoint | Dosya | Açıklama |
|--------|----------|-------|----------|
| GET | `/api/v1/tenants/:tenantId/quiz-questions` | `getAllQuestions.ts` | Tüm soruları listele |
| POST | `/api/v1/tenants/:tenantId/quiz-questions` | `createQuestion.ts` | Yeni soru oluştur |
| GET | `/api/v1/tenants/:tenantId/quiz-questions/:questionId` | `getQuestionById.ts` | Soru detayı |
| PATCH | `/api/v1/tenants/:tenantId/quiz-questions/:questionId` | `updateQuestion.ts` | Soru güncelle |
| DELETE | `/api/v1/tenants/:tenantId/quiz-questions/:questionId` | `deleteQuestion.ts` | Soru sil |
| GET | `/api/v1/tenants/:tenantId/quiz-questions/category/:categoryId` | `getQuestionsByCategory.ts` | Kategoriye göre soru |
| GET | `/api/v1/tenants/:tenantId/quiz-questions/random` | `getRandomQuestions.ts` | Rastgele soru getir |
| GET | `/api/v1/tenants/:tenantId/quiz-questions/stats` | `getQuestionStats.ts` | Soru istatistikleri |
| PATCH | `/api/v1/tenants/:tenantId/quiz-questions/:questionId/toggle` | `toggleQuestionStatus.ts` | Aktif/pasif |
| POST | `/api/v1/tenants/:tenantId/quiz-questions/bulk-import` | `bulkImportQuestions.ts` | Excel toplu yükle |
| GET | `/api/v1/tenants/:tenantId/quiz-questions/excel-template` | `downloadExcelTemplate.ts` | Excel şablon indir |
| POST | `/api/v1/tenants/:tenantId/quiz-questions/validate-excel` | `validateExcelFile.ts` | Excel doğrula |

### 🟢 QuizSets API
**Klasör:** `functions/quizSets/`

| Method | Endpoint | Dosya | Açıklama |
|--------|----------|-------|----------|
| GET | `/api/v1/tenants/:tenantId/quiz-sets` | `getAllQuizSets.ts` | Tüm quiz setleri listele |
| POST | `/api/v1/tenants/:tenantId/quiz-sets` | `createQuizSet.ts` | Yeni quiz set oluştur |
| GET | `/api/v1/tenants/:tenantId/quiz-sets/:quizSetId` | `getQuizSetById.ts` | Quiz set detayı |
| PATCH | `/api/v1/tenants/:tenantId/quiz-sets/:quizSetId` | `updateQuizSet.ts` | Quiz set güncelle |
| DELETE | `/api/v1/tenants/:tenantId/quiz-sets/:quizSetId` | `deleteQuizSet.ts` | Quiz set sil |
| PATCH | `/api/v1/tenants/:tenantId/quiz-sets/:quizSetId/toggle` | `toggleQuizSetStatus.ts` | Aktif/pasif |

### 🟡 UserQuizAssignments API
**Klasör:** `functions/userQuizAssignments/`

| Method | Endpoint | Dosya | Açıklama |
|--------|----------|-------|----------|
| POST | `/api/v1/tenants/:tenantId/quiz-assignments` | `assignQuizToUser.ts` | Kullanıcıya quiz ata |
| GET | `/api/v1/tenants/:tenantId/quiz-assignments` | `getAllAssignments.ts` | Tüm atamaları listele (Admin) |
| GET | `/api/v1/tenants/:tenantId/users/:userId/quiz-assignments` | `getUserAssignments.ts` | Kullanıcının atamaları |
| GET | `/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId` | `getAssignmentById.ts` | Atama detayı |
| POST | `/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId/start` | `startQuiz.ts` | Quiz başlat |
| PATCH | `/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId` | `updateAssignment.ts` | Atama güncelle |
| DELETE | `/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId` | `deleteAssignment.ts` | Atama sil |

### 🔴 QuizSessions API (EKSİK)
**Klasör:** `functions/quizSessions/` (oluşturulacak)

| Method | Endpoint | Dosya | Açıklama | Durum |
|--------|----------|-------|----------|-------|
| GET | `/api/v1/tenants/:tenantId/quiz-sessions/:sessionId` | `getSessionById.ts` | Aktif session detayı | ❌ Eksik |
| POST | `/api/v1/tenants/:tenantId/quiz-sessions/:sessionId/answer` | `submitAnswer.ts` | Cevap gönder | ❌ Eksik |
| POST | `/api/v1/tenants/:tenantId/quiz-sessions/:sessionId/complete` | `completeQuiz.ts` | Quiz'i tamamla | ❌ Eksik |
| GET | `/api/v1/tenants/:tenantId/quiz-sessions/:sessionId/results` | `getSessionResults.ts` | Sonuçları getir | ❌ Eksik |

---

## 🎬 TAM SÜREÇ SİMÜLASYONU

### **Senaryo:** Admin bir quiz oluşturup kullanıcıya atıyor, kullanıcı quiz'i çözüp sonuçları görüyor.

---

### **ADIM 1: Soru Oluşturma (Admin)**

**API:**
```http
POST /api/v1/tenants/tenant1/quiz-questions
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "title": "JavaScript Değişken Tanımlama",
  "question": "JavaScript'te değişken tanımlamak için hangi anahtar kelimeler kullanılır?",
  "options": [
    { "optionId": "a", "text": "var, let, const", "isCorrect": true },
    { "optionId": "b", "text": "int, float, string", "isCorrect": false },
    { "optionId": "c", "text": "dim, set, define", "isCorrect": false },
    { "optionId": "d", "text": "variable, value, data", "isCorrect": false }
  ],
  "difficulty": "easy",
  "points": 10,
  "tags": ["javascript", "variables"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67890question1",
    "title": "JavaScript Değişken Tanımlama",
    "question": "JavaScript'te değişken tanımlamak için hangi anahtar kelimeler kullanılır?",
    "options": [...],
    "points": 10,
    "difficulty": "easy",
    "isActive": true
  }
}
```

**DB Değişimi:**
```javascript
// QuizQuestions koleksiyonuna eklendi
{
  _id: "67890question1",
  tenantId: "tenant1",
  title: "JavaScript Değişken Tanımlama",
  question: "JavaScript'te değişken tanımlamak için hangi anahtar kelimeler kullanılır?",
  options: [
    { optionId: "a", text: "var, let, const", isCorrect: true },
    { optionId: "b", text: "int, float, string", isCorrect: false },
    { optionId: "c", text: "dim, set, define", isCorrect: false },
    { optionId: "d", text: "variable, value, data", isCorrect: false }
  ],
  difficulty: "easy",
  points: 10,
  tags: ["javascript", "variables"],
  isActive: true,
  createdAt: "2025-10-24T10:00:00Z"
}
```

**Kullanılan Dosya:** `functions/quizQuestions/createQuestion.ts`

---

### **ADIM 2: Daha Fazla Soru Oluşturma (4 soru daha)**

**Tekrar aynı API çağrılır, toplamda 5 soru oluşturuldu:**
- `67890question1` - JavaScript Değişken (10 puan)
- `67890question2` - JavaScript Fonksiyon (10 puan)
- `67890question3` - JavaScript Array (10 puan)
- `67890question4` - JavaScript Object (10 puan)
- `67890question5` - JavaScript Loop (10 puan)

---

### **ADIM 3: Quiz Set Oluşturma (Admin)**

**API:**
```http
POST /api/v1/tenants/tenant1/quiz-sets
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "title": "JavaScript Temel Quiz",
  "description": "JavaScript temel konularını kapsayan quiz",
  "questionIds": [
    "67890question1",
    "67890question2",
    "67890question3",
    "67890question4",
    "67890question5"
  ],
  "timeLimit": 15,
  "passingScore": 60,
  "maxAttempts": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "set12345",
    "title": "JavaScript Temel Quiz",
    "description": "JavaScript temel konularını kapsayan quiz",
    "questionIds": ["67890question1", "67890question2", "67890question3", "67890question4", "67890question5"],
    "totalQuestions": 5,
    "totalPoints": 50,
    "timeLimit": 15,
    "passingScore": 60,
    "difficulty": "medium",
    "maxAttempts": 3,
    "isActive": true
  }
}
```

**DB Değişimi:**
```javascript
// QuizSets koleksiyonuna eklendi
{
  _id: "set12345",
  tenantId: "tenant1",
  title: "JavaScript Temel Quiz",
  description: "JavaScript temel konularını kapsayan quiz",
  questionIds: ["67890question1", "67890question2", "67890question3", "67890question4", "67890question5"],
  totalQuestions: 5,
  totalPoints: 50,
  timeLimit: 15,
  passingScore: 60,
  difficulty: "medium",
  tags: [],
  shuffleQuestions: false,
  shuffleOptions: false,
  allowRetake: true,
  maxAttempts: 3,
  showResults: "immediately",
  isActive: true,
  createdAt: "2025-10-24T10:30:00Z"
}
```

**Kullanılan Dosya:** `functions/quizSets/createQuizSet.ts`

---

### **ADIM 4: Kullanıcıya Quiz Atama (Admin)**

**API:**
```http
POST /api/v1/tenants/tenant1/quiz-assignments
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "userId": "user123",
  "quizSetId": "set12345",
  "dueDate": "2025-10-30T23:59:59Z",
  "priority": "high",
  "notes": "Bu hafta tamamlanmalı"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "assign001",
    "userId": "user123",
    "quizSetId": "set12345",
    "status": "assigned",
    "assignedBy": "admin1",
    "assignedAt": "2025-10-24T10:45:00Z",
    "dueDate": "2025-10-30T23:59:59Z",
    "attempts": 0,
    "priority": "high",
    "notes": "Bu hafta tamamlanmalı"
  }
}
```

**DB Değişimi:**
```javascript
// UserQuizAssignments koleksiyonuna eklendi
{
  _id: "assign001",
  userId: "user123",
  quizSetId: "set12345",
  tenantId: "tenant1",
  assignedBy: "admin1",
  assignedAt: "2025-10-24T10:45:00Z",
  dueDate: "2025-10-30T23:59:59Z",
  startedAt: null,
  completedAt: null,
  status: "assigned",
  attempts: 0,
  lastAttemptAt: null,
  bestScore: null,
  bestScorePercentage: null,
  notes: "Bu hafta tamamlanmalı",
  priority: "high",
  createdAt: "2025-10-24T10:45:00Z"
}
```

**Kullanılan Dosya:** `functions/userQuizAssignments/assignQuizToUser.ts`

---

### **ADIM 5: Kullanıcı Atananları Görüyor**

**API:**
```http
GET /api/v1/tenants/tenant1/users/user123/quiz-assignments
Authorization: Bearer {user123_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "assign001",
        "userId": "user123",
        "quizSetId": {
          "_id": "set12345",
          "title": "JavaScript Temel Quiz",
          "description": "JavaScript temel konularını kapsayan quiz",
          "totalQuestions": 5,
          "totalPoints": 50,
          "timeLimit": 15,
          "passingScore": 60,
          "difficulty": "medium"
        },
        "status": "assigned",
        "attempts": 0,
        "dueDate": "2025-10-30T23:59:59Z",
        "priority": "high",
        "assignedAt": "2025-10-24T10:45:00Z",
        "assignedBy": {
          "_id": "admin1",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        }
      }
    ],
    "count": 1
  }
}
```

**Kullanıcı Ekranında Görünen:**
```
┌─────────────────────────────────────────────────┐
│ 📋 Atanan Quiz'lerim                            │
├─────────────────────────────────────────────────┤
│ 🎯 JavaScript Temel Quiz                        │
│    JavaScript temel konularını kapsayan quiz    │
│                                                  │
│    📊 5 Soru  |  💯 50 Puan  |  ⏱️ 15 dk        │
│    🎚️ Orta Zorluk  |  📈 Geçme: %60            │
│    🔄 Kalan Hak: 3/3                            │
│    📅 Son Tarih: 30 Ekim 2025                   │
│    🔴 Öncelik: Yüksek                           │
│                                                  │
│    [🚀 Teste Başla]                             │
└─────────────────────────────────────────────────┘
```

**Kullanılan Dosya:** `functions/userQuizAssignments/getUserAssignments.ts`

---

### **ADIM 6: Quiz Başlatma (Kullanıcı)**

**API:**
```http
POST /api/v1/tenants/tenant1/quiz-assignments/assign001/start
Authorization: Bearer {user123_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "_id": "session001",
      "sessionId": "assign001_1729766400000_abc123",
      "userId": "user123",
      "quizSetId": "set12345",
      "assignmentId": "assign001",
      "attemptNumber": 1,
      "totalQuestions": 5,
      "answeredQuestions": 0,
      "correctAnswers": 0,
      "totalPoints": 0,
      "maxPossiblePoints": 50,
      "scorePercentage": 0,
      "totalTimeSpent": 0,
      "timeLimit": 900,
      "status": "active",
      "startedAt": "2025-10-24T14:00:00Z"
    },
    "quizSet": {
      "_id": "set12345",
      "title": "JavaScript Temel Quiz",
      "description": "JavaScript temel konularını kapsayan quiz",
      "totalQuestions": 5,
      "totalPoints": 50,
      "timeLimit": 15,
      "passingScore": 60,
      "difficulty": "medium",
      "shuffleQuestions": false,
      "shuffleOptions": false,
      "questionIds": ["67890question1", "67890question2", "67890question3", "67890question4", "67890question5"]
    }
  },
  "message": "Quiz başarıyla başlatıldı"
}
```

**DB Değişimi:**
```javascript
// QuizSessions koleksiyonuna eklendi
{
  _id: "session001",
  userId: "user123",
  quizSetId: "set12345",
  assignmentId: "assign001",
  tenantId: "tenant1",
  sessionId: "assign001_1729766400000_abc123",
  attemptNumber: 1,
  totalQuestions: 5,
  answeredQuestions: 0,
  correctAnswers: 0,
  totalPoints: 0,
  maxPossiblePoints: 50,
  scorePercentage: 0,
  totalTimeSpent: 0,
  timeLimit: 900,
  status: "active",
  startedAt: "2025-10-24T14:00:00Z",
  completedAt: null,
  isPassed: null,
  createdAt: "2025-10-24T14:00:00Z"
}

// UserQuizAssignments güncellendi
{
  _id: "assign001",
  status: "started", // ✅ assigned → started
  startedAt: "2025-10-24T14:00:00Z", // ✅
  attempts: 1, // ✅ 0 → 1
  lastAttemptAt: "2025-10-24T14:00:00Z" // ✅
}
```

**Kullanıcı Ekranında:**
```
┌─────────────────────────────────────────────────┐
│ ⏱️ Kalan Süre: 15:00                            │
│ 📊 İlerleme: 0/5 Soru                           │
├─────────────────────────────────────────────────┤
│ Soru 1/5                                        │
│                                                  │
│ JavaScript'te değişken tanımlamak için hangi    │
│ anahtar kelimeler kullanılır?                   │
│                                                  │
│ ⭕ A) var, let, const                           │
│ ⭕ B) int, float, string                        │
│ ⭕ C) dim, set, define                          │
│ ⭕ D) variable, value, data                     │
│                                                  │
│ [İleri →]                                       │
└─────────────────────────────────────────────────┘
```

**Kullanılan Dosya:** `functions/userQuizAssignments/startQuiz.ts`

---

### **ADIM 7: İlk Soruyu Cevaplama (Kullanıcı)** ❌ EKSİK API

**API:** (Oluşturulacak)
```http
POST /api/v1/tenants/tenant1/quiz-sessions/assign001_1729766400000_abc123/answer
Authorization: Bearer {user123_token}
```

**Request Body:**
```json
{
  "questionId": "67890question1",
  "selectedOptionId": "a",
  "timeSpent": 45
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "earnedPoints": 10,
    "correctOptionId": "a",
    "explanation": null,
    "progress": {
      "answeredQuestions": 1,
      "totalQuestions": 5,
      "currentScore": 10,
      "maxPossibleScore": 50
    }
  }
}
```

**DB Değişimi:**
```javascript
// UserQuizAnswers koleksiyonuna eklendi
{
  _id: "ans001",
  userId: "user123",
  questionId: "67890question1",
  tenantId: "tenant1",
  quizSessionId: "assign001_1729766400000_abc123",
  selectedOptionId: "a",
  isCorrect: true,
  timeSpent: 45,
  earnedPoints: 10,
  answeredAt: "2025-10-24T14:00:45Z",
  createdAt: "2025-10-24T14:00:45Z"
}

// QuizSessions güncellendi
{
  _id: "session001",
  answeredQuestions: 1, // ✅ 0 → 1
  correctAnswers: 1, // ✅ 0 → 1
  totalPoints: 10, // ✅ 0 → 10
  totalTimeSpent: 45 // ✅ 0 → 45
}
```

**Kullanılan Dosya:** `functions/quizSessions/submitAnswer.ts` (EKSİK)

---

### **ADIM 8: Kalan Soruları Cevaplama (2-5. sorular)**

**Aynı API 4 kez daha çağrılır:**

**2. Soru - YANLIŞ:**
```json
{
  "questionId": "67890question2",
  "selectedOptionId": "b",
  "timeSpent": 50
}
```
→ `isCorrect: false`, `earnedPoints: 0`

**3. Soru - DOĞRU:**
```json
{
  "questionId": "67890question3",
  "selectedOptionId": "c",
  "timeSpent": 60
}
```
→ `isCorrect: true`, `earnedPoints: 10`

**4. Soru - DOĞRU:**
```json
{
  "questionId": "67890question4",
  "selectedOptionId": "a",
  "timeSpent": 55
}
```
→ `isCorrect: true`, `earnedPoints: 10`

**5. Soru - DOĞRU:**
```json
{
  "questionId": "67890question5",
  "selectedOptionId": "d",
  "timeSpent": 40
}
```
→ `isCorrect: true`, `earnedPoints: 10`

**DB Değişimi (5. soru sonrası):**
```javascript
// UserQuizAnswers: 5 kayıt eklendi (ans001, ans002, ans003, ans004, ans005)

// QuizSessions güncel durumu
{
  _id: "session001",
  answeredQuestions: 5, // ✅ Tüm sorular cevaplandı
  correctAnswers: 4, // ✅ 4 doğru, 1 yanlış
  totalPoints: 40, // ✅ 50 üzerinden 40
  scorePercentage: 0, // Henüz hesaplanmadı
  totalTimeSpent: 250, // ✅ 45+50+60+55+40 = 250 saniye
  status: "active" // Henüz tamamlanmadı
}
```

---

### **ADIM 9: Quiz Tamamlama (Kullanıcı)** ❌ EKSİK API

**API:** (Oluşturulacak)
```http
POST /api/v1/tenants/tenant1/quiz-sessions/assign001_1729766400000_abc123/complete
Authorization: Bearer {user123_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "assign001_1729766400000_abc123",
    "totalQuestions": 5,
    "answeredQuestions": 5,
    "correctAnswers": 4,
    "totalPoints": 40,
    "maxPossiblePoints": 50,
    "scorePercentage": 80,
    "totalTimeSpent": 250,
    "isPassed": true,
    "passingScore": 60,
    "completedAt": "2025-10-24T14:04:10Z"
  },
  "message": "Quiz başarıyla tamamlandı! Tebrikler, geçtiniz!"
}
```

**DB Değişimi:**
```javascript
// QuizSessions güncellendi
{
  _id: "session001",
  answeredQuestions: 5,
  correctAnswers: 4,
  totalPoints: 40,
  maxPossiblePoints: 50,
  scorePercentage: 80, // ✅ (40/50) * 100 = 80%
  totalTimeSpent: 250,
  status: "completed", // ✅ active → completed
  completedAt: "2025-10-24T14:04:10Z", // ✅
  isPassed: true, // ✅ 80% > 60% geçme notu
  updatedAt: "2025-10-24T14:04:10Z"
}

// UserQuizAssignments güncellendi
{
  _id: "assign001",
  status: "completed", // ✅ started → completed
  completedAt: "2025-10-24T14:04:10Z", // ✅
  bestScore: 40, // ✅
  bestScorePercentage: 80, // ✅
  updatedAt: "2025-10-24T14:04:10Z"
}
```

**Kullanılan Dosya:** `functions/quizSessions/completeQuiz.ts` (EKSİK)

---

### **ADIM 10: Sonuçları Görüntüleme (Kullanıcı)** ❌ EKSİK API

**API:** (Oluşturulacak)
```http
GET /api/v1/tenants/tenant1/quiz-sessions/assign001_1729766400000_abc123/results
Authorization: Bearer {user123_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "sessionId": "assign001_1729766400000_abc123",
      "attemptNumber": 1,
      "totalQuestions": 5,
      "answeredQuestions": 5,
      "correctAnswers": 4,
      "totalPoints": 40,
      "maxPossiblePoints": 50,
      "scorePercentage": 80,
      "totalTimeSpent": 250,
      "isPassed": true,
      "passingScore": 60,
      "startedAt": "2025-10-24T14:00:00Z",
      "completedAt": "2025-10-24T14:04:10Z"
    },
    "answers": [
      {
        "questionId": "67890question1",
        "question": "JavaScript'te değişken tanımlamak için hangi anahtar kelimeler kullanılır?",
        "selectedOptionId": "a",
        "selectedOptionText": "var, let, const",
        "correctOptionId": "a",
        "correctOptionText": "var, let, const",
        "isCorrect": true,
        "earnedPoints": 10,
        "timeSpent": 45
      },
      {
        "questionId": "67890question2",
        "question": "JavaScript fonksiyon nasıl tanımlanır?",
        "selectedOptionId": "b",
        "selectedOptionText": "func myFunction()",
        "correctOptionId": "a",
        "correctOptionText": "function myFunction()",
        "isCorrect": false,
        "earnedPoints": 0,
        "timeSpent": 50
      },
      {
        "questionId": "67890question3",
        "question": "JavaScript'te dizi nasıl oluşturulur?",
        "selectedOptionId": "c",
        "selectedOptionText": "let arr = []",
        "correctOptionId": "c",
        "correctOptionText": "let arr = []",
        "isCorrect": true,
        "earnedPoints": 10,
        "timeSpent": 60
      },
      {
        "questionId": "67890question4",
        "question": "JavaScript'te obje nasıl oluşturulur?",
        "selectedOptionId": "a",
        "selectedOptionText": "let obj = {}",
        "correctOptionId": "a",
        "correctOptionText": "let obj = {}",
        "isCorrect": true,
        "earnedPoints": 10,
        "timeSpent": 55
      },
      {
        "questionId": "67890question5",
        "question": "JavaScript'te döngü nasıl yapılır?",
        "selectedOptionId": "d",
        "selectedOptionText": "for (let i = 0; i < 10; i++)",
        "correctOptionId": "d",
        "correctOptionText": "for (let i = 0; i < 10; i++)",
        "isCorrect": true,
        "earnedPoints": 10,
        "timeSpent": 40
      }
    ],
    "quizSet": {
      "title": "JavaScript Temel Quiz",
      "description": "JavaScript temel konularını kapsayan quiz"
    }
  }
}
```

**Kullanıcı Ekranında:**
```
┌─────────────────────────────────────────────────┐
│ 🎉 Quiz Tamamlandı!                             │
├─────────────────────────────────────────────────┤
│ JavaScript Temel Quiz                           │
│                                                  │
│ ✅ GEÇTINIZ!                                    │
│                                                  │
│ 📊 Sonuçlarınız:                                │
│ • Toplam Soru: 5                                │
│ • Doğru Cevap: 4 ✅                             │
│ • Yanlış Cevap: 1 ❌                            │
│ • Toplam Puan: 40/50                            │
│ • Başarı Yüzdesi: %80 🎯                        │
│ • Geçme Notu: %60                               │
│ • Harcanan Süre: 4 dk 10 sn                     │
│                                                  │
├─────────────────────────────────────────────────┤
│ 📝 Cevaplarınız:                                │
│                                                  │
│ 1️⃣ JavaScript'te değişken tanımlamak...        │
│    Cevabınız: A) var, let, const ✅            │
│    Süre: 45 saniye                              │
│                                                  │
│ 2️⃣ JavaScript fonksiyon nasıl...               │
│    Cevabınız: B) func myFunction() ❌          │
│    Doğru Cevap: A) function myFunction()        │
│    Süre: 50 saniye                              │
│                                                  │
│ 3️⃣ JavaScript'te dizi nasıl...                 │
│    Cevabınız: C) let arr = [] ✅               │
│    Süre: 60 saniye                              │
│                                                  │
│ 4️⃣ JavaScript'te obje nasıl...                 │
│    Cevabınız: A) let obj = {} ✅               │
│    Süre: 55 saniye                              │
│                                                  │
│ 5️⃣ JavaScript'te döngü nasıl...                │
│    Cevabınız: D) for (let i = 0; i < 10; i++)✅│
│    Süre: 40 saniye                              │
│                                                  │
│ [Tekrar Dene (2 hak kaldı)] [Ana Sayfaya Dön]  │
└─────────────────────────────────────────────────┘
```

**Kullanılan Dosya:** `functions/quizSessions/getSessionResults.ts` (EKSİK)

---

### **ADIM 11: Tekrar Deneme (Opsiyonel)**

Eğer kullanıcı tekrar denemek isterse:

1. **ADIM 6'ya geri dön** → `POST /quiz-assignments/assign001/start`
2. Yeni `QuizSessions` oluşturulur → `attemptNumber: 2`
3. `UserQuizAssignments.attempts: 2` olur
4. Aynı süreç tekrarlanır
5. Eğer bu denemede daha yüksek puan alırsa:
   - `UserQuizAssignments.bestScore` güncellenir
   - `UserQuizAssignments.bestScorePercentage` güncellenir

---

## 📊 Veritabanı Final Durumu

### QuizQuestions (5 kayıt)
```javascript
{ _id: "67890question1", question: "JavaScript'te değişken...", points: 10 }
{ _id: "67890question2", question: "JavaScript fonksiyon...", points: 10 }
{ _id: "67890question3", question: "JavaScript'te dizi...", points: 10 }
{ _id: "67890question4", question: "JavaScript'te obje...", points: 10 }
{ _id: "67890question5", question: "JavaScript'te döngü...", points: 10 }
```

### QuizSets (1 kayıt)
```javascript
{
  _id: "set12345",
  title: "JavaScript Temel Quiz",
  questionIds: ["67890question1", "67890question2", "67890question3", "67890question4", "67890question5"],
  totalQuestions: 5,
  totalPoints: 50,
  passingScore: 60,
  maxAttempts: 3
}
```

### UserQuizAssignments (1 kayıt)
```javascript
{
  _id: "assign001",
  userId: "user123",
  quizSetId: "set12345",
  status: "completed",
  attempts: 1,
  bestScore: 40,
  bestScorePercentage: 80,
  assignedAt: "2025-10-24T10:45:00Z",
  startedAt: "2025-10-24T14:00:00Z",
  completedAt: "2025-10-24T14:04:10Z",
  dueDate: "2025-10-30T23:59:59Z"
}
```

### QuizSessions (1 kayıt)
```javascript
{
  _id: "session001",
  sessionId: "assign001_1729766400000_abc123",
  userId: "user123",
  quizSetId: "set12345",
  assignmentId: "assign001",
  attemptNumber: 1,
  totalQuestions: 5,
  answeredQuestions: 5,
  correctAnswers: 4,
  totalPoints: 40,
  scorePercentage: 80,
  totalTimeSpent: 250,
  status: "completed",
  isPassed: true,
  startedAt: "2025-10-24T14:00:00Z",
  completedAt: "2025-10-24T14:04:10Z"
}
```

### UserQuizAnswers (5 kayıt)
```javascript
{ _id: "ans001", questionId: "67890question1", selectedOptionId: "a", isCorrect: true, earnedPoints: 10, timeSpent: 45 }
{ _id: "ans002", questionId: "67890question2", selectedOptionId: "b", isCorrect: false, earnedPoints: 0, timeSpent: 50 }
{ _id: "ans003", questionId: "67890question3", selectedOptionId: "c", isCorrect: true, earnedPoints: 10, timeSpent: 60 }
{ _id: "ans004", questionId: "67890question4", selectedOptionId: "a", isCorrect: true, earnedPoints: 10, timeSpent: 55 }
{ _id: "ans005", questionId: "67890question5", selectedOptionId: "d", isCorrect: true, earnedPoints: 10, timeSpent: 40 }
```

---

## ✅ MEVCUT DURUM

### Hazır Olan API'ler (25):
- ✅ QuizQuestions: 12 endpoint
- ✅ QuizSets: 6 endpoint
- ✅ UserQuizAssignments: 7 endpoint

### Eksik Olan API'ler (4):
- ❌ QuizSessions: `getSessionById.ts`
- ❌ QuizSessions: `submitAnswer.ts`
- ❌ QuizSessions: `completeQuiz.ts`
- ❌ QuizSessions: `getSessionResults.ts`

---

## 🎯 SONRAKİ ADIMLAR

1. `functions/quizSessions/` klasörü oluştur
2. 4 eksik API dosyasını oluştur:
   - `getSessionById.ts`
   - `submitAnswer.ts`
   - `completeQuiz.ts`
   - `getSessionResults.ts`
3. `flow-config.json`'a QuizSessions endpoint'lerini ekle
4. Frontend entegrasyonu yap

---

## 📁 DOSYA YAPISI

```
server/
├── models/
│   ├── QuizQuestions.model.ts
│   ├── QuizSets.model.ts
│   ├── UserQuizAssignments.model.ts
│   ├── QuizSessions.model.ts
│   └── UserQuizAnswers.model.ts
│
├── services/
│   └── index.ts (QuizQuestionsService, QuizSetsService, UserQuizAssignmentsService, QuizSessionsService)
│
├── functions/
│   ├── quizQuestions/
│   │   ├── getAllQuestions.ts
│   │   ├── createQuestion.ts
│   │   ├── getQuestionById.ts
│   │   ├── updateQuestion.ts
│   │   ├── deleteQuestion.ts
│   │   ├── getQuestionsByCategory.ts
│   │   ├── getRandomQuestions.ts
│   │   ├── getQuestionStats.ts
│   │   ├── toggleQuestionStatus.ts
│   │   ├── bulkImportQuestions.ts
│   │   ├── downloadExcelTemplate.ts
│   │   ├── validateExcelFile.ts
│   │   └── index.ts
│   │
│   ├── quizSets/
│   │   ├── getAllQuizSets.ts
│   │   ├── createQuizSet.ts
│   │   ├── getQuizSetById.ts
│   │   ├── updateQuizSet.ts
│   │   ├── deleteQuizSet.ts
│   │   ├── toggleQuizSetStatus.ts
│   │   └── index.ts
│   │
│   ├── userQuizAssignments/
│   │   ├── assignQuizToUser.ts
│   │   ├── getAllAssignments.ts
│   │   ├── getUserAssignments.ts
│   │   ├── getAssignmentById.ts
│   │   ├── startQuiz.ts
│   │   ├── updateAssignment.ts
│   │   ├── deleteAssignment.ts
│   │   └── index.ts
│   │
│   └── quizSessions/ (❌ EKSİK)
│       ├── getSessionById.ts (❌)
│       ├── submitAnswer.ts (❌)
│       ├── completeQuiz.ts (❌)
│       ├── getSessionResults.ts (❌)
│       └── index.ts (❌)
│
└── flow-config.json (QuizSessions endpoint'leri eksik)
```

---

**Bu dokümantasyon quiz sisteminin tüm sürecini baştan sona detaylı olarak açıklamaktadır.** 🎓
