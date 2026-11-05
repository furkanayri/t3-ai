// Quiz Sistemi Simülasyonu
// Bu dosya sadece örnek veri gösterimi içindir - gerçek database işlemleri değil

console.log("🎯 QUIZ SİSTEMİ SİMÜLASYONU\n");

// 1. ÖNCE SORULAR OLUŞTURULUYOR (QuizQuestions)
console.log("1️⃣ SORULAR OLUŞTURULUYOR:");
console.log("=" .repeat(50));

const questions = [
    {
        _id: "q1",
        tenantId: "tenant123",
        categoryId: "javascript_category",
        title: "JavaScript Değişken Tanımlama",
        question: "JavaScript'te 'let' ve 'var' arasındaki temel fark nedir?",
        options: [
            { optionId: "a", text: "Hiç fark yok", isCorrect: false },
            { optionId: "b", text: "let block-scoped, var function-scoped", isCorrect: true },
            { optionId: "c", text: "var daha hızlıdır", isCorrect: false },
            { optionId: "d", text: "let sadece string için kullanılır", isCorrect: false }
        ],
        difficulty: "medium",
        timeLimit: 60,
        points: 15,
        explanation: "let block scope'a sahipken, var function scope'a sahiptir."
    },
    {
        _id: "q2", 
        tenantId: "tenant123",
        categoryId: "javascript_category",
        title: "Array Metodları",
        question: "Aşağıdakilerden hangisi JavaScript array metodudur?",
        options: [
            { optionId: "a", text: "push()", isCorrect: true },
            { optionId: "b", text: "append()", isCorrect: false },
            { optionId: "c", text: "add()", isCorrect: false },
            { optionId: "d", text: "insert()", isCorrect: false }
        ],
        difficulty: "easy",
        timeLimit: 45,
        points: 10
    },
    {
        _id: "q3",
        tenantId: "tenant123", 
        categoryId: "javascript_category",
        title: "Fonksiyon Tanımlama",
        question: "Arrow function syntax'ı hangisidir?",
        options: [
            { optionId: "a", text: "function() => {}", isCorrect: false },
            { optionId: "b", text: "() => {}", isCorrect: true },
            { optionId: "c", text: "=> () {}", isCorrect: false },
            { optionId: "d", text: "function => () {}", isCorrect: false }
        ],
        difficulty: "medium", 
        timeLimit: 50,
        points: 12
    }
];

questions.forEach((q, index) => {
    console.log(`Soru ${index + 1}: ${q.title}`);
    console.log(`  ${q.question}`);
    q.options.forEach(opt => {
        console.log(`  ${opt.optionId}) ${opt.text} ${opt.isCorrect ? '✓' : ''}`);
    });
    console.log(`  Puan: ${q.points}, Süre: ${q.timeLimit}s, Zorluk: ${q.difficulty}\n`);
});

// 2. SORU GRUBU OLUŞTURULUYOR (QuizSets)
console.log("2️⃣ SORU GRUBU OLUŞTURULUYOR:");
console.log("=" .repeat(50));

const quizSet = {
    _id: "quizset_js_basic",
    tenantId: "tenant123",
    categoryId: "javascript_category", 
    title: "JavaScript Temel Seviye Testi",
    description: "JavaScript'in temel kavramlarını test eden quiz",
    instructions: "Her soru için belirtilen süre kadar zamanınız var. Dikkatli okuyun ve en iyi cevabı seçin.",
    questionIds: ["q1", "q2", "q3"],
    totalQuestions: 3,
    totalPoints: 37, // 15+10+12
    timeLimit: 10, // 10 dakika toplam
    passingScore: 25, // %67 başarı
    difficulty: "medium",
    shuffleQuestions: true,
    shuffleOptions: false,
    allowRetake: true,
    maxAttempts: 2,
    showResults: "after_completion",
    isActive: true
};

console.log(`Quiz Set: ${quizSet.title}`);
console.log(`Açıklama: ${quizSet.description}`);
console.log(`Toplam Soru: ${quizSet.totalQuestions}`);
console.log(`Toplam Puan: ${quizSet.totalPoints}`);  
console.log(`Süre Limiti: ${quizSet.timeLimit} dakika`);
console.log(`Geçme Puanı: ${quizSet.passingScore}/${quizSet.totalPoints}`);
console.log(`Maksimum Deneme: ${quizSet.maxAttempts}\n`);

// 3. KULLANICIYA ATANIYOR (UserQuizAssignments)
console.log("3️⃣ KULLANICIYA ATANIYOR:");
console.log("=" .repeat(50));

const assignment = {
    _id: "assignment_1",
    userId: "user_ahmet_123",
    quizSetId: "quizset_js_basic",
    tenantId: "tenant123", 
    assignedBy: "admin_mehmet",
    assignedAt: new Date("2025-10-24T10:00:00Z"),
    dueDate: new Date("2025-10-31T23:59:59Z"), // 1 hafta sonra
    status: "assigned",
    attempts: 0,
    bestScore: null,
    bestScorePercentage: null,
    priority: "high",
    notes: "Yeni işe başlayan için oryantasyon testi"
};

console.log(`👤 Kullanıcı: ${assignment.userId}`);
console.log(`📋 Quiz: ${quizSet.title}`);
console.log(`👨‍💼 Atan: ${assignment.assignedBy}`);
console.log(`📅 Atanma: ${assignment.assignedAt.toLocaleDateString('tr-TR')}`);
console.log(`⏰ Son Tarih: ${assignment.dueDate.toLocaleDateString('tr-TR')}`);
console.log(`🔴 Öncelik: ${assignment.priority.toUpperCase()}`);
console.log(`📝 Not: ${assignment.notes}\n`);

// 4. KULLANICI TESTİ BAŞLATIYOR (QuizSessions)  
console.log("4️⃣ KULLANICI TESTİ BAŞLATIYOR:");
console.log("=" .repeat(50));

const session = {
    _id: "session_001",
    userId: "user_ahmet_123",
    quizSetId: "quizset_js_basic",
    assignmentId: "assignment_1", 
    tenantId: "tenant123",
    sessionId: "quiz_1729764000000",
    attemptNumber: 1,
    totalQuestions: 3,
    answeredQuestions: 0,
    correctAnswers: 0,
    totalPoints: 0,
    maxPossiblePoints: 37,
    scorePercentage: 0,
    totalTimeSpent: 0,
    timeLimit: 600, // 10 dakika = 600 saniye
    status: "active", 
    startedAt: new Date("2025-10-24T14:30:00Z")
};

console.log(`🎮 Oturum ID: ${session.sessionId}`);
console.log(`📊 Deneme: ${session.attemptNumber}/${quizSet.maxAttempts}`);
console.log(`⏱️ Başlama: ${session.startedAt.toLocaleString('tr-TR')}`);
console.log(`⏰ Süre Limiti: ${session.timeLimit/60} dakika`);
console.log(`📈 Durum: ${session.status.toUpperCase()}\n`);

// 5. KULLANICI SORULARI CEVAPLIYOR (UserQuizAnswers)
console.log("5️⃣ KULLANICI SORULARI CEVAPLIYOR:");
console.log("=" .repeat(50));

const userAnswers = [
    {
        _id: "answer_1",
        userId: "user_ahmet_123", 
        questionId: "q1",
        tenantId: "tenant123",
        quizSessionId: "quiz_1729764000000",
        selectedOptionId: "b", // Doğru cevap!
        isCorrect: true,
        timeSpent: 45, // 45 saniye
        earnedPoints: 15,
        answeredAt: new Date("2025-10-24T14:30:45Z")
    },
    {
        _id: "answer_2", 
        userId: "user_ahmet_123",
        questionId: "q2", 
        tenantId: "tenant123",
        quizSessionId: "quiz_1729764000000",
        selectedOptionId: "a", // Doğru cevap!
        isCorrect: true,
        timeSpent: 30,
        earnedPoints: 10,
        answeredAt: new Date("2025-10-24T14:31:15Z")
    },
    {
        _id: "answer_3",
        userId: "user_ahmet_123",
        questionId: "q3",
        tenantId: "tenant123", 
        quizSessionId: "quiz_1729764000000",
        selectedOptionId: "c", // Yanlış cevap!
        isCorrect: false,
        timeSpent: 55,
        earnedPoints: 0,
        answeredAt: new Date("2025-10-24T14:32:10Z")
    }
];

userAnswers.forEach((answer, index) => {
    const question = questions.find(q => q._id === answer.questionId);
    const correctOption = question.options.find(opt => opt.isCorrect);
    const selectedOption = question.options.find(opt => opt.optionId === answer.selectedOptionId);
    
    console.log(`Soru ${index + 1}: ${question.title}`);
    console.log(`  Seçilen: ${answer.selectedOptionId}) ${selectedOption.text}`);
    console.log(`  Doğru: ${correctOption.optionId}) ${correctOption.text}`);
    console.log(`  Sonuç: ${answer.isCorrect ? '✅ DOĞRU' : '❌ YANLIŞ'}`);
    console.log(`  Süre: ${answer.timeSpent}s, Puan: ${answer.earnedPoints}/${question.points}\n`);
});

// 6. TEST TAMAMLANIYOR VE SONUÇ HESAPLANIYOR  
console.log("6️⃣ TEST TAMAMLANIYOR:");
console.log("=" .repeat(50));

// Oturum güncelleniyor
const finalSession = {
    ...session,
    answeredQuestions: 3,
    correctAnswers: 2, // q1 ve q2 doğru
    totalPoints: 25, // 15+10+0
    scorePercentage: Math.round((25/37) * 100), // %67
    totalTimeSpent: 130, // 45+30+55 saniye
    status: "completed",
    completedAt: new Date("2025-10-24T14:32:10Z"),
    isPassed: 25 >= quizSet.passingScore // true
};

// Assignment güncelleniyor
const finalAssignment = {
    ...assignment,
    status: "completed",
    attempts: 1,
    lastAttemptAt: finalSession.completedAt,
    bestScore: 25,
    bestScorePercentage: 67,
    completedAt: finalSession.completedAt
};

console.log(`📊 SONUÇLAR:`);
console.log(`  Toplam Soru: ${finalSession.totalQuestions}`);
console.log(`  Doğru Cevap: ${finalSession.correctAnswers}/${finalSession.totalQuestions}`);
console.log(`  Alınan Puan: ${finalSession.totalPoints}/${finalSession.maxPossiblePoints}`);
console.log(`  Başarı Yüzdesi: %${finalSession.scorePercentage}`);
console.log(`  Geçme Puanı: ${quizSet.passingScore} puan`);
console.log(`  Durum: ${finalSession.isPassed ? '🎉 GEÇTİ!' : '😞 KALDI'}`);
console.log(`  Toplam Süre: ${Math.floor(finalSession.totalTimeSpent/60)}dk ${finalSession.totalTimeSpent%60}s`);
console.log(`  Tamamlanma: ${finalSession.completedAt.toLocaleString('tr-TR')}\n`);

// 7. ÖZET RAPOR
console.log("7️⃣ ÖZET RAPOR:");
console.log("=" .repeat(50));

console.log(`🏢 Tenant: ${assignment.tenantId}`);
console.log(`👤 Kullanıcı: ${assignment.userId}`);
console.log(`📋 Test: ${quizSet.title}`);
console.log(`🎯 Kategori: ${questions[0].categoryId}`);
console.log(`📊 Sonuç: ${finalSession.totalPoints}/${finalSession.maxPossiblePoints} puan (%${finalSession.scorePercentage})`);
console.log(`✅ Durum: ${finalSession.isPassed ? 'BAŞARILI' : 'BAŞARISIZ'}`);
console.log(`🔁 Deneme: ${finalAssignment.attempts}/${quizSet.maxAttempts}`);
console.log(`⏰ Süre: ${finalSession.totalTimeSpent}s / ${session.timeLimit}s`);

if (finalAssignment.attempts < quizSet.maxAttempts && !finalSession.isPassed) {
    console.log(`\n💡 Kullanıcı ${quizSet.maxAttempts - finalAssignment.attempts} deneme hakkı daha var!`);
}

console.log(`\n🎯 SİMÜLASYON TAMAMLANDI!`);
console.log(`Bu örnekte kullanıcı ${finalSession.correctAnswers}/${finalSession.totalQuestions} doğru cevap verdi ve testi geçti.`);