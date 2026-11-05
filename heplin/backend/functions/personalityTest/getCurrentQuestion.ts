import { Context } from 'koa';
import { ACTIVE_PERSONALITY_TEST_QUESTIONS, PERSONALITY_TEST_CONFIG } from '@/constants/personalityTestQuestions';

// Mevcut soruyu getir
export default async function getCurrentQuestion(ctx: Context) {
    try {
        const userId = ctx.state.user?._id;
        const { sessionId } = ctx.params;

        // Session kontrolü
        const session = await ctx.service('personalityTestSession').findById(sessionId);
        if (!session) {
            ctx.status = 404;
            ctx.body = {
                error: 'Test oturumu bulunamadı'
            };
            return;
        }

        // Kullanıcı kontrolü
        if (session.userId.toString() !== userId.toString()) {
            ctx.status = 403;
            ctx.body = {
                error: 'Bu test oturumuna erişim yetkiniz yok'
            };
            return;
        }

        if (session.status !== 'in-progress') {
            ctx.status = 400;
            ctx.body = {
                error: 'Test oturumu aktif değil',
                status: session.status
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

        // Kalan süreyi hesapla
        const timeRemaining = Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000);

        if (session.totalQuestions !== PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS) {
            await ctx.service('personalityTestSession').update(sessionId, {
                totalQuestions: PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS
            });
        }

        // Mevcut soruyu getir
        const currentQuestion = ACTIVE_PERSONALITY_TEST_QUESTIONS.find(
            q => q.order === session.currentQuestionIndex + 1
        );

        if (!currentQuestion) {
            ctx.status = 404;
            ctx.body = {
                error: 'Soru bulunamadı'
            };
            return;
        }

        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                currentQuestion,
                currentQuestionIndex: session.currentQuestionIndex,
                answeredQuestions: session.answeredQuestions,
                totalQuestions: PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS,
                timeRemaining
            }
        };

    } catch (error: any) {
        console.error('Get current question error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'Soru getirilirken bir hata oluştu',
            details: error.message
        };
    }
}
