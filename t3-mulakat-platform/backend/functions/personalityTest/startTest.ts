import { Context } from 'koa';
import { ACTIVE_PERSONALITY_TEST_QUESTIONS, PERSONALITY_TEST_CONFIG } from '@/constants/personalityTestQuestions';

// Test başlat
export default async function startTest(ctx: Context) {
    try {
        const userId = ctx.state.user?._id;
        const tenantId = ctx.params.tenantId ?? null; 

        // Kullanıcının daha önce test alıp almadığını kontrol et
        const existingSession = await ctx.service('personalityTestSession').findOne({
            userId,
            tenantId,
            status: { $in: ['completed', 'in-progress'] }
        });

        if (existingSession) {
            ctx.status = 400;
            ctx.body = {
                error: existingSession.status === 'completed'
                    ? 'Bu testi daha önce tamamladınız'
                    : 'Devam eden bir test oturumunuz var'
            };
            return;
        }

        // Yeni session oluştur
        const startTime = new Date();
        const expiresAt = new Date(startTime.getTime() + PERSONALITY_TEST_CONFIG.DURATION_SECONDS * 1000);

        const session = await ctx.service('personalityTestSession').create({
            userId,
            tenantId,
            status: 'in-progress',
            currentQuestionIndex: 0,
            totalQuestions: PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS,
            answeredQuestions: 0,
            startTime,
            expiresAt
        });

        // İlk soruyu getir (order = 1)
        const firstQuestion = ACTIVE_PERSONALITY_TEST_QUESTIONS.find(q => q.order === 1);

        ctx.status = 201;
        ctx.body = {
            success: true,
            message: 'Test başlatıldı',
            data: {
                sessionId: session._id,
                testInfo: {
                    name: PERSONALITY_TEST_CONFIG.TEST_NAME,
                    description: PERSONALITY_TEST_CONFIG.TEST_DESCRIPTION,
                    totalQuestions: PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS,
                    durationMinutes: PERSONALITY_TEST_CONFIG.DURATION_MINUTES
                },
                currentQuestion: firstQuestion,
                currentQuestionIndex: 0,
                expiresAt: session.expiresAt
            }
        };

    } catch (error: any) {
        console.error('Start test error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'Test başlatılırken bir hata oluştu',
            details: error.message
        };
    }
}
