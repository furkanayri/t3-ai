import { Context } from 'koa';
import { ACTIVE_PERSONALITY_TEST_QUESTIONS, PERSONALITY_TEST_CONFIG, calculateScore } from '@/constants/personalityTestQuestions';

// Cevap kaydet ve sonraki soruyu getir
export default async function submitAnswer(ctx: Context) {
    try {
        const userId = ctx.state.user?._id;
        const tenantId = ctx.params.tenantId ?? null;
        const { sessionId } = ctx.params;
        const { questionId, score } = ctx.request.body;

        // Validasyon
        if (!questionId || !score) {
            ctx.status = 400;
            ctx.body = {
                error: 'questionId ve score alanları zorunludur'
            };
            return;
        }

        if (score < 1 || score > 10) {
            ctx.status = 400;
            ctx.body = {
                error: 'Skor 1 ile 10 arasında olmalıdır'
            };
            return;
        }

        // Session kontrolü
        const session = await ctx.service('personalityTestSession').findById(sessionId);
        if (!session) {
            ctx.status = 404;
            ctx.body = {
                error: 'Test oturumu bulunamadı'
            };
            return;
        }

        if (session.status !== 'in-progress') {
            console.log(`Session status is: ${session.status}, expected: in-progress`);
            ctx.status = 400;
            ctx.body = {
                error: `Test oturumu aktif değil. Durum: ${session.status}`
            };
            return;
        }

        // Süre kontrolü
        const now = new Date();
        if (session.expiresAt < now) {
            await ctx.service('personalityTestSession').update(sessionId, {
                status: 'expired',
                endTime: now
            });
            ctx.status = 400;
            ctx.body = {
                error: 'Test süresi doldu'
            };
            return;
        }

        // Soru bilgisini al
        const question = ACTIVE_PERSONALITY_TEST_QUESTIONS.find(q => q.id === Number(questionId));
        if (!question) {
            ctx.status = 404;
            ctx.body = {
                error: 'Soru bulunamadı'
            };
            return;
        }

        // Bu soruya daha önce cevap verilmiş mi kontrol et
        const existingAnswer = await ctx.service('personalityTestAnswer').findOne({
            sessionId,
            questionId: Number(questionId)
        });

        if (existingAnswer) {
            ctx.status = 400;
            ctx.body = {
                error: 'Bu soruya zaten cevap verilmiş'
            };
            return;
        }

        // Reverse scoring uygula
        const calculatedScore = calculateScore(score, question.scoreType);

        // Cevabı kaydet
        await ctx.service('personalityTestAnswer').create({
            sessionId,
            userId,
            tenantId,
            questionId: Number(questionId),
            score,
            calculatedScore,
            subDimension: question.subDimension,
            scoreType: question.scoreType,
            answeredAt: new Date()
        });

        // Session'ı güncelle
        const newQuestionIndex = session.currentQuestionIndex + 1;
        const answeredQuestions = session.answeredQuestions + 1;

        await ctx.service('personalityTestSession').update(sessionId, {
            currentQuestionIndex: newQuestionIndex,
            answeredQuestions
        });

        // Test tamamlandı mı?
        const isCompleted = answeredQuestions >= PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS;

        if (isCompleted) {
            await ctx.service('personalityTestSession').update(sessionId, {
                status: 'completed',
                endTime: new Date()
            });

            ctx.status = 200;
            ctx.body = {
                success: true,
                message: 'Test tamamlandı',
                data: {
                    isCompleted: true,
                    sessionId
                }
            };
            return;
        }

        // Sonraki soruyu getir
        const nextQuestion = ACTIVE_PERSONALITY_TEST_QUESTIONS.find(q => q.order === newQuestionIndex + 1);

        ctx.status = 200;
        ctx.body = {
            success: true,
            message: 'Cevap kaydedildi',
            data: {
                isCompleted: false,
                currentQuestionIndex: newQuestionIndex,
                nextQuestion: nextQuestion,
                answeredQuestions,
                totalQuestions: PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS
            }
        };

    } catch (error: any) {
        console.error('Submit answer error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'Cevap kaydedilirken bir hata oluştu',
            details: error.message
        };
    }
}
