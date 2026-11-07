import { Context } from 'koa';

// Session detaylarını getir (tüm cevaplarla birlikte)
export default async function getSessionDetails(ctx: Context) {
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

        // Tüm cevapları getir
        const answers = await ctx.service('personalityTestAnswer').find({
            sessionId: session._id
        }).sort({ answeredAt: 1 });

        // Cevap detaylarını soru bilgileriyle birleştir
        const { PERSONALITY_TEST_QUESTIONS } = await import('@/constants/personalityTestQuestions');
        
        const answersWithQuestions = answers.map((answer: any) => {
            const question = PERSONALITY_TEST_QUESTIONS.find(q => q.id === answer.questionId);
            return {
                questionId: answer.questionId,
                questionText: question?.questionText,
                questionOrder: question?.order,
                subDimension: answer.subDimension,
                scoreType: answer.scoreType,
                userScore: answer.score,
                calculatedScore: answer.calculatedScore,
                answeredAt: answer.answeredAt
            };
        });

        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                session: {
                    id: session._id,
                    status: session.status,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    totalQuestions: session.totalQuestions,
                    answeredQuestions: session.answeredQuestions
                },
                answers: answersWithQuestions,
                totalAnswers: answersWithQuestions.length
            }
        };

    } catch (error: any) {
        console.error('Get session details error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'Session detayları getirilirken bir hata oluştu',
            details: error.message
        };
    }
}
