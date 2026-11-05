// Quiz Question payload temizleme yardımcı fonksiyonu
export function cleanQuizQuestionPayload(payload: any): any {
    const cleanedPayload = { ...payload };

    // CategoryId'yi temizle - boş string ise sil
    if (cleanedPayload.categoryId === '' || cleanedPayload.categoryId === null || cleanedPayload.categoryId === undefined) {
        delete cleanedPayload.categoryId;
    }

    // Tags'i temizle - boş array veya undefined ise sil
    if (!cleanedPayload.tags || (Array.isArray(cleanedPayload.tags) && cleanedPayload.tags.length === 0)) {
        delete cleanedPayload.tags;
    }

    // Description'ı temizle - boş string ise sil
    if (cleanedPayload.description === '' || cleanedPayload.description === null) {
        delete cleanedPayload.description;
    }

    // Explanation'ı temizle - boş string ise sil
    if (cleanedPayload.explanation === '' || cleanedPayload.explanation === null) {
        delete cleanedPayload.explanation;
    }

    // TimeLimit'i temizle - 0 veya boş ise sil
    if (!cleanedPayload.timeLimit || cleanedPayload.timeLimit <= 0) {
        delete cleanedPayload.timeLimit;
    }

    // Title'ı temizle - boş string ise sil
    if (cleanedPayload.title === '' || cleanedPayload.title === null) {
        delete cleanedPayload.title;
    }

    // Points'i kontrol et - 0 veya negatifse default 10 yap
    if (!cleanedPayload.points || cleanedPayload.points <= 0) {
        cleanedPayload.points = 10;
    }

    // Difficulty'yi kontrol et - geçersizse default medium yap
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!cleanedPayload.difficulty || !validDifficulties.includes(cleanedPayload.difficulty)) {
        cleanedPayload.difficulty = 'medium';
    }

    return cleanedPayload;
}

// Question validation yardımcı fonksiyonu
export function validateQuizQuestion(payload: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Soru metni kontrolü
    if (!payload.question || payload.question.trim() === '') {
        errors.push('Soru metni gereklidir');
    }

    // Şık kontrolü
    if (!payload.options || !Array.isArray(payload.options) || payload.options.length < 2) {
        errors.push('En az 2 şık gereklidir');
    } else {
        // Boş şık kontrolü
        const hasEmptyOption = payload.options.some((opt: any) => !opt.text || opt.text.trim() === '');
        if (hasEmptyOption) {
            errors.push('Tüm şıklar doldurulmalıdır');
        }

        // Doğru cevap kontrolü
        const hasCorrectAnswer = payload.options.some((opt: any) => opt.isCorrect === true);
        if (!hasCorrectAnswer) {
            errors.push('En az bir şık doğru olarak işaretlenmelidir');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}