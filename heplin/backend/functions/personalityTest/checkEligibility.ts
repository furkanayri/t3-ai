import { Context } from 'koa';
import { PERSONALITY_TEST_CONFIG } from '@/constants/personalityTestQuestions';

// Kullanıcının teste katılma uygunluğunu kontrol et
export default async function checkEligibility(ctx: Context) {
    try {
        const userId = ctx.state.user?._id;

        // Kullanıcının daha önce test alıp almadığını kontrol et
        const existingSession = await ctx.service('personalityTestSession').findOne({
            userId,
            status: { $in: ['completed', 'in-progress'] }
        });

        if (existingSession) {
            if (
                existingSession.status === 'in-progress' &&
                existingSession.totalQuestions !== PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS
            ) {
                await ctx.service('personalityTestSession').update(existingSession._id, {
                    totalQuestions: PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS
                });
                existingSession.totalQuestions = PERSONALITY_TEST_CONFIG.TOTAL_QUESTIONS;
            }

            ctx.status = 200;
            ctx.body = {
                isEligible: false,
                message: existingSession.status === 'completed' 
                    ? 'Bu testi daha önce tamamladınız' 
                    : 'Devam eden bir test oturumunuz var',
                existingSession: {
                    id: existingSession._id,
                    status: existingSession.status,
                    startTime: existingSession.startTime,
                    currentQuestionIndex: existingSession.currentQuestionIndex,
                    answeredQuestions: existingSession.answeredQuestions,
                    totalQuestions: existingSession.totalQuestions
                }
            };
            return;
        }

        ctx.status = 200;
        ctx.body = {
            isEligible: true,
            message: 'Teste başlayabilirsiniz'
        };

    } catch (error: any) {
        console.error('Eligibility check error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'Uygunluk kontrolü yapılırken bir hata oluştu',
            details: error.message
        };
    }
}
