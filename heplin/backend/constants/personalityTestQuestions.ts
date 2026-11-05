export interface PersonalityTestQuestion {
    id: number;
    questionText: string;
    subDimension: string;
    scoreType: 'Doğrusal Puan' | 'Reverse Puan';
    order: number;
}

export const PERSONALITY_TEST_QUESTIONS: PersonalityTestQuestion[] = [
    { id: 13, questionText: "Kimsenin sormadığı soruları sormaktan keyif alırım.", subDimension: "İnovatif", scoreType: "Doğrusal Puan", order: 1 },
    { id: 42, questionText: "Her işi yalnız yapmayı tercih ederim.", subDimension: "Takım Çalışmasına Yatkın", scoreType: "Reverse Puan", order: 2 },
    { id: 5, questionText: "Endişe verici bir durumda hızlıca sakinleşebilirim.", subDimension: "Duygusal Dengeli", scoreType: "Doğrusal Puan", order: 3 },
    { id: 18, questionText: "Mevcut durumları sorgulamak bana gereksiz gelir.", subDimension: "İnovatif", scoreType: "Reverse Puan", order: 4 },
    { id: 31, questionText: "İnsanların halini hatrını sormayı önemserim.", subDimension: "Anlayışlı", scoreType: "Doğrusal Puan", order: 5 },
    { id: 10, questionText: "Fikirlerimin sorgulanmasından rahatsızlık duyarım.", subDimension: "Esnek", scoreType: "Reverse Puan", order: 6 },
    { id: 22, questionText: "Olayların anlamlarını hemen kavrayamam.", subDimension: "Kavrayışı Güçlü", scoreType: "Reverse Puan", order: 7 },
    { id: 55, questionText: "Aynı anda birçok şeyi dengeli biçimde idare edebilirim.", subDimension: "Becerikli", scoreType: "Doğrusal Puan", order: 8 },
    { id: 7, questionText: "Eleştirileri sakin bir şekilde kabul edebilirim.", subDimension: "Esnek", scoreType: "Doğrusal Puan", order: 9 },
    { id: 39, questionText: "Bana söylenen sırları saklarım.", subDimension: "İçten", scoreType: "Doğrusal Puan", order: 10 },
    { id: 47, questionText: "Hedeflerime ulaşmak için çaba gösteririm.", subDimension: "Azimli", scoreType: "Doğrusal Puan", order: 11 },
    { id: 16, questionText: "Karmaşık problemleri çözmek beni zorlar.", subDimension: "İnovatif", scoreType: "Reverse Puan", order: 12 },
    { id: 60, questionText: "İşlerimde sık sık hata yaparım.", subDimension: "Sorumluluk Sahibi", scoreType: "Reverse Puan", order: 13 },
    { id: 35, questionText: "İnsanların hislerini önemsemem.", subDimension: "Anlayışlı", scoreType: "Reverse Puan", order: 14 },
    { id: 3, questionText: "Beklenmedik olaylar karşısında tepkilerimi kontrol edebilirim.", subDimension: "Duygusal Dengeli", scoreType: "Doğrusal Puan", order: 15 },
    { id: 56, questionText: "Baskı altındayken etkili çalışamam.", subDimension: "Becerikli", scoreType: "Reverse Puan", order: 16 },
    { id: 19, questionText: "Yeni bilgileri kolayca kavrayabilirim.", subDimension: "Kavrayışı Güçlü", scoreType: "Doğrusal Puan", order: 17 },
    { id: 30, questionText: "Yeni bilgileri öğrenmek için fazladan çaba harcamam.", subDimension: "Öğrenme Odaklı", scoreType: "Reverse Puan", order: 18 },
    { id: 24, questionText: "Çabuk öğrenmekte zorlanırım.", subDimension: "Kavrayışı Güçlü", scoreType: "Reverse Puan", order: 19 },
    { id: 62, questionText: "İşlerimi zamanında bitirmekte zorlanırım.", subDimension: "Sorumluluk Sahibi", scoreType: "Reverse Puan", order: 20 },
    { id: 14, questionText: "Yeni fikirler üretmekte zorlanırım.", subDimension: "İnovatif", scoreType: "Reverse Puan", order: 21 },
    { id: 9, questionText: "Yeni durumlara kolayca uyum sağlarım.", subDimension: "Esnek", scoreType: "Doğrusal Puan", order: 22 },
    { id: 50, questionText: "Engellerle karşılaştığımda işleri bırakırım.", subDimension: "Azimli", scoreType: "Reverse Puan", order: 23 },
    { id: 28, questionText: "İşlerin nasıl yürüdüğünü merak etmem.", subDimension: "Öğrenme Odaklı", scoreType: "Reverse Puan", order: 24 },
    { id: 46, questionText: "Başkalarının fikirlerini önemsemem.", subDimension: "Takım Çalışmasına Yatkın", scoreType: "Reverse Puan", order: 25 },
    { id: 53, questionText: "Zor işlerin üstesinden gelirim.", subDimension: "Becerikli", scoreType: "Doğrusal Puan", order: 26 },
    { id: 4, questionText: "Ruh halim çok sık değişir.", subDimension: "Duygusal Dengeli", scoreType: "Reverse Puan", order: 27 },
    { id: 59, questionText: "İşlerimi yarım bırakmam.", subDimension: "Sorumluluk Sahibi", scoreType: "Doğrusal Puan", order: 28 },
    { id: 27, questionText: "Bir şeyler yapmak için yeni yollar aramayı severim.", subDimension: "Öğrenme Odaklı", scoreType: "Doğrusal Puan", order: 29 },
    { id: 1, questionText: "Zorlayıcı durumlarda bile sakin kalırım.", subDimension: "Duygusal Dengeli", scoreType: "Doğrusal Puan", order: 30 },
    { id: 38, questionText: "Verdiğim sözü tutarım.", subDimension: "İçten", scoreType: "Doğrusal Puan", order: 31 },
    { id: 15, questionText: "Olaylar arasında kolayca bağlantı kurabilirim.", subDimension: "İnovatif", scoreType: "Doğrusal Puan", order: 32 },
    { id: 33, questionText: "İnsanlar için bir şeyler yapmaktan hoşlanırım.", subDimension: "Anlayışlı", scoreType: "Doğrusal Puan", order: 33 },
    { id: 45, questionText: "Ekip başarısından çok bireysel başarıyı önemserim.", subDimension: "Takım Çalışmasına Yatkın", scoreType: "Reverse Puan", order: 34 },
    { id: 51, questionText: "Birçok işi tamamlamak için çaba gösteririm.", subDimension: "Azimli", scoreType: "Doğrusal Puan", order: 35 },
    { id: 17, questionText: "Başkalarının fikirlerine farklı bir açıdan bakabilirim.", subDimension: "İnovatif", scoreType: "Doğrusal Puan", order: 36 },
    { id: 48, questionText: "Bir işe başlamakta zorlanırım.", subDimension: "Azimli", scoreType: "Reverse Puan", order: 37 },
    { id: 20, questionText: "Karmaşık bilgileri anlamakta zorlanırım.", subDimension: "Kavrayışı Güçlü", scoreType: "Reverse Puan", order: 38 },
    { id: 57, questionText: "Görevlerimi başarıyla tamamlarım.", subDimension: "Becerikli", scoreType: "Doğrusal Puan", order: 39 },
    { id: 12, questionText: "Tartışmalarda kendi görüşümden vazgeçmekte zorlanırım.", subDimension: "Esnek", scoreType: "Reverse Puan", order: 40 },
    { id: 36, questionText: "Fikirlerimi dürüstçe ifade ederim.", subDimension: "İçten", scoreType: "Doğrusal Puan", order: 41 },
    { id: 26, questionText: "Karmaşık konuları derinlemesine incelemek bana zor gelir.", subDimension: "Öğrenme Odaklı", scoreType: "Reverse Puan", order: 42 },
    { id: 61, questionText: "Detaylara dikkat ederim.", subDimension: "Sorumluluk Sahibi", scoreType: "Doğrusal Puan", order: 43 },
    { id: 21, questionText: "Birçok bilgiyi bir arada kullanabilirim.", subDimension: "Kavrayışı Güçlü", scoreType: "Doğrusal Puan", order: 44 },
    { id: 32, questionText: "İnsanların duygularını anlayıp paylaşmakta zorlanırım.", subDimension: "Anlayışlı", scoreType: "Reverse Puan", order: 45 },
    { id: 40, questionText: "Doğruyu söylemek yerine durumu idare etmeyi tercih ederim.", subDimension: "İçten", scoreType: "Reverse Puan", order: 46 },
    { id: 34, questionText: "İnsanların ihtiyaçlarına duyarlı davranırım.", subDimension: "Anlayışlı", scoreType: "Doğrusal Puan", order: 47 },
    { id: 41, questionText: "Bir grubun parçası olmaktan zevk alırım.", subDimension: "Takım Çalışmasına Yatkın", scoreType: "Doğrusal Puan", order: 48 },
    { id: 44, questionText: "Rekabetten çok işbirliğine önem veririm.", subDimension: "Takım Çalışmasına Yatkın", scoreType: "Doğrusal Puan", order: 49 },
    { id: 23, questionText: "Olaylardan kendi başıma sonuç çıkarma yeteneğim vardır.", subDimension: "Kavrayışı Güçlü", scoreType: "Doğrusal Puan", order: 50 },
    { id: 52, questionText: "Yaptığım işe aklımı tam olarak veremem.", subDimension: "Azimli", scoreType: "Reverse Puan", order: 51 },
    { id: 29, questionText: "Kendimi geliştirmeye özen gösteririm.", subDimension: "Öğrenme Odaklı", scoreType: "Doğrusal Puan", order: 52 },
    { id: 2, questionText: "Küçük aksilikler beni kolayca kaygılandırır.", subDimension: "Duygusal Dengeli", scoreType: "Reverse Puan", order: 53 },
    { id: 49, questionText: "Kendim ve etrafımdaki insanlar için standartları yüksek tutarım.", subDimension: "Azimli", scoreType: "Doğrusal Puan", order: 54 },
    { id: 43, questionText: "Takım arkadaşlarımı desteklemekten hoşlanırım.", subDimension: "Takım Çalışmasına Yatkın", scoreType: "Doğrusal Puan", order: 55 },
    { id: 58, questionText: "Sorunlarla karşılaştığımda hemen harekete geçmekte zorlanırım.", subDimension: "Becerikli", scoreType: "Reverse Puan", order: 56 },
    { id: 25, questionText: "Yeni şeyler öğrenmekten keyif alırım.", subDimension: "Öğrenme Odaklı", scoreType: "Doğrusal Puan", order: 57 },
    { id: 63, questionText: "Planlı çalışarak işlerin doğru yapılmasını sağlarım.", subDimension: "Sorumluluk Sahibi", scoreType: "Doğrusal Puan", order: 58 },
    { id: 8, questionText: "Değişiklik fikrinden hoşlanmam.", subDimension: "Esnek", scoreType: "Reverse Puan", order: 59 },
    { id: 54, questionText: "Karmaşık problemlerle uğraşmakta zorlanırım.", subDimension: "Becerikli", scoreType: "Reverse Puan", order: 60 },
    { id: 6, questionText: "Baskı altında kaldığımda duygularımı kontrol etmekte zorlanırım.", subDimension: "Duygusal Dengeli", scoreType: "Reverse Puan", order: 61 },
    { id: 11, questionText: "Başkalarıyla fikir alışverişi yapmaktan keyif alırım.", subDimension: "Esnek", scoreType: "Doğrusal Puan", order: 62 },
    { id: 64, questionText: "Görevlerimi tamamlarken dikkatsiz davranırım.", subDimension: "Sorumluluk Sahibi", scoreType: "Reverse Puan", order: 63 },
    { id: 37, questionText: "Bazı durumlarda insanlara karşı dürüst olmamayı tercih ederim.", subDimension: "İçten", scoreType: "Reverse Puan", order: 64 }
];

const configuredQuestionLimit = Number(process.env.PERSONALITY_TEST_QUESTION_LIMIT);
const questionLimit = Number.isInteger(configuredQuestionLimit) && configuredQuestionLimit > 0
    ? Math.min(configuredQuestionLimit, PERSONALITY_TEST_QUESTIONS.length)
    : PERSONALITY_TEST_QUESTIONS.length;

export const ACTIVE_PERSONALITY_TEST_QUESTIONS = PERSONALITY_TEST_QUESTIONS.slice(0, questionLimit);

// Test konfigürasyonu
export const PERSONALITY_TEST_CONFIG = {
    TOTAL_QUESTIONS: ACTIVE_PERSONALITY_TEST_QUESTIONS.length,
    DURATION_MINUTES: 15, // Test için 15 dakika
    DURATION_SECONDS: 15 * 60, // 900 saniye
    MIN_SCORE: 1,
    MAX_SCORE: 10,
    TEST_NAME: "Kişilik Envanteri Testi",
    TEST_DESCRIPTION: "Bu test kişilik özelliklerinizi değerlendirmek için tasarlanmıştır. Her soruyu 1'den 10'a kadar puanlayınız."
};

// Alt boyutları getir
export const getSubDimensions = (): string[] => {
    const dimensions = new Set(PERSONALITY_TEST_QUESTIONS.map(q => q.subDimension));
    return Array.from(dimensions);
};

// Belirli bir alt boyuta ait soruları getir
export const getQuestionsBySubDimension = (subDimension: string): PersonalityTestQuestion[] => {
    return PERSONALITY_TEST_QUESTIONS.filter(q => q.subDimension === subDimension);
};

// Soru ID'sine göre soru getir
export const getQuestionById = (id: number): PersonalityTestQuestion | undefined => {
    return PERSONALITY_TEST_QUESTIONS.find(q => q.id === id);
};

// Order'a göre soru getir
export const getQuestionByOrder = (order: number): PersonalityTestQuestion | undefined => {
    return PERSONALITY_TEST_QUESTIONS.find(q => q.order === order);
};

// Reverse scoring hesaplama fonksiyonu
export const calculateScore = (rawScore: number, scoreType: 'Doğrusal Puan' | 'Reverse Puan'): number => {
    if (scoreType === 'Reverse Puan') {
        // 1 -> 10, 2 -> 9, 3 -> 8, ..., 10 -> 1
        return 11 - rawScore;
    }
    return rawScore;
};
