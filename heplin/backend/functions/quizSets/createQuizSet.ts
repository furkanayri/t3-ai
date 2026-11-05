import { Context } from 'koa';

// Quiz set oluşturma
export default async function createQuizSet(ctx: Context) {
    try {
        const {
            title,
            description,
            questionIds,
            timeLimit,
            passingScore = 60,
            maxAttempts = 3
        } = ctx.request.body;

        // Validation
        if (!title || !title.trim()) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Quiz set başlığı zorunludur' 
            };
            return;
        }

        if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
            ctx.status = 400;
            ctx.body = { 
                error: 'En az bir soru seçilmelidir' 
            };
            return;
        }

        // Soruların varlığını kontrol et
        const existingQuestions = await ctx.service('quizQuestions').findAll({
            _id: { $in: questionIds },
            tenantId: ctx.params.tenantId,
            isActive: true
        });

        if (existingQuestions.results.length !== questionIds.length) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Seçilen sorulardan bazıları bulunamadı veya aktif değil',
                foundQuestions: existingQuestions.results.length,
                requestedQuestions: questionIds.length
            };
            return;
        }

        // Soruları al ve toplam puan/soru sayısını hesapla
        const questions = existingQuestions.results;
        const totalQuestions = questions.length;
        const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 10), 0);

        // Quiz set verilerini hazırla
        const quizSetData = {
            title: title.trim(),
            description: description?.trim(),
            questionIds,
            totalQuestions,
            totalPoints,
            timeLimit: timeLimit > 0 ? timeLimit : null,
            passingScore: Math.max(0, Math.min(100, passingScore)),
            difficulty: 'medium',
            tags: [],
            shuffleQuestions: false,
            shuffleOptions: false,
            allowRetake: true,
            maxAttempts: Math.max(1, maxAttempts),
            showResults: 'immediately',
            tenantId: ctx.params.tenantId,
            createdBy: ctx.state.user?._id,
            isActive: true
        };

        const newQuizSet = await ctx.service('quizSets').create(quizSetData);

        ctx.body = {
            success: true,
            data: newQuizSet,
            message: 'Quiz set başarıyla oluşturuldu'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Quiz set oluşturulurken bir hata oluştu',
            details: error.message 
        };
    }
}