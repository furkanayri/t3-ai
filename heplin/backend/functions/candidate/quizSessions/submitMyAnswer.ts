import { Context } from 'koa';

// Candidate'in cevap göndermesi
export default async function submitMyAnswer(ctx: Context) {
    try {
        const { sessionId } = ctx.params;
        const { questionId, answer, timeSpent } = ctx.request.body;
        const userId = ctx.state.user._id;

        console.log('Submit Answer Request:', { sessionId, questionId, answer, timeSpent, userId });

        if (!sessionId || !questionId || answer === undefined) {
            ctx.status = 400;
            ctx.body = { error: 'Session ID, question ID ve cevap zorunludur' };
            return;
        }

        // Session'ı kontrol et
        const session = await ctx.service('quizSessions').findOne({
            sessionId: sessionId,
            userId: userId
        }, {
            populate: [{ path: 'quizSetId' }]
        });

        if (!session) {
            ctx.status = 404;
            ctx.body = { error: 'Session bulunamadı veya size ait değil' };
            return;
        }

        if (session.status === 'completed') {
            ctx.status = 400;
            ctx.body = { error: 'Bu quiz zaten tamamlanmış' };
            return;
        }

        if (session.status === 'expired') {
            ctx.status = 400;
            ctx.body = { error: 'Bu quiz süresi dolmuş' };
            return;
        }

        // Zaman kontrolü
        if (session.timeLimit) {
            const elapsedTime = Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000);
            if (elapsedTime > session.timeLimit) {
                await ctx.service('quizSessions').update(session._id, {
                    status: 'expired'
                });
                ctx.status = 400;
                ctx.body = { error: 'Quiz süresi doldu' };
                return;
            }
        }

        // Soruyu getir
        const question = await ctx.service('quizQuestions').findOne({ _id: questionId });
        if (!question) {
            ctx.status = 404;
            ctx.body = { error: 'Soru bulunamadı' };
            return;
        }

        // Cevabın doğruluğunu kontrol et
        const isCorrect = question.correctAnswer === answer;
        const points = isCorrect ? (question.points || 0) : 0;

        console.log('Answer validation:', { isCorrect, points, correctAnswer: question.correctAnswer, userAnswer: answer });

        // Cevabı kaydet veya güncelle
        const existingAnswer = await ctx.service('userQuizAnswers').findOne({
            sessionId: session._id,
            questionId: questionId
        });

        console.log('Existing answer:', existingAnswer);

        if (existingAnswer) {
            // Mevcut cevabı güncelle
            await ctx.service('userQuizAnswers').update(existingAnswer._id, {
                answer,
                isCorrect,
                points,
                timeSpent: (existingAnswer.timeSpent || 0) + (timeSpent || 0),
                answeredAt: new Date()
            });
        } else {
            // Yeni cevap oluştur
            const newAnswer = await ctx.service('userQuizAnswers').create({
                userId: userId,
                sessionId: session._id,
                questionId: questionId,
                answer,
                isCorrect,
                points,
                timeSpent: timeSpent || 0,
                answeredAt: new Date()
            });
            console.log('New answer created:', newAnswer);
        }

        // Session'ı güncelle
        const allAnswers = await ctx.service('userQuizAnswers').findAll({
            sessionId: session._id
        });

        const answeredQuestions = allAnswers.data?.length || 0;
        const correctAnswers = allAnswers.data?.filter(a => a.isCorrect).length || 0;
        const totalPoints = allAnswers.data?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;
        const totalTimeSpent = allAnswers.data?.reduce((sum, a) => sum + (a.timeSpent || 0), 0) || 0;
        const scorePercentage = session.maxPossiblePoints > 0
            ? Math.round((totalPoints / session.maxPossiblePoints) * 100)
            : 0;

        await ctx.service('quizSessions').update(session._id, {
            answeredQuestions,
            correctAnswers,
            totalPoints,
            totalTimeSpent,
            scorePercentage
        });

        ctx.body = {
            success: true,
            data: {
                isCorrect,
                points,
                totalPoints,
                answeredQuestions,
                totalQuestions: session.totalQuestions,
                scorePercentage
            },
            message: 'Cevap başarıyla kaydedildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            error: 'Cevap kaydedilirken bir hata oluştu',
            details: error.message
        };
    }
}
