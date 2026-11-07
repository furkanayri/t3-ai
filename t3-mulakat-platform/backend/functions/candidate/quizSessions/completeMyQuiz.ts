import { Context } from 'koa';

// Candidate'in quiz'i tamamlaması
export default async function completeMyQuiz(ctx: Context) {
    try {
        const { sessionId } = ctx.params;
        const userId = ctx.state.user._id;

        if (!sessionId) {
            ctx.status = 400;
            ctx.body = { error: 'Session ID zorunludur' };
            return;
        }

        // Session'ı kontrol et
        const session = await ctx.service('quizSessions').findOne({
            sessionId: sessionId,
            userId: userId
        }, {
            populate: [{ path: 'quizSetId' }, { path: 'assignmentId' }]
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

        // Tüm cevapları getir
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

        // Quiz'in geçip geçmediğini kontrol et
        const quizSet = session.quizSetId;
        const isPassed = scorePercentage >= (quizSet.passingScore || 0);

        // Session'ı tamamla
        await ctx.service('quizSessions').update(session._id, {
            status: 'completed',
            answeredQuestions,
            correctAnswers,
            totalPoints,
            totalTimeSpent,
            scorePercentage,
            isPassed,
            passed: isPassed, // Backward compatibility
            completedAt: new Date()
        });

        // Assignment'ı güncelle
        const assignment = session.assignmentId;
        if (assignment) {
            // En iyi skoru bul
            const allSessions = await ctx.service('quizSessions').findAll({
                assignmentId: assignment._id,
                status: 'completed'
            });

            const sessionsData = allSessions?.data || allSessions?.results || [];
            const bestScore = Math.max(
                ...(sessionsData.length > 0 ? sessionsData.map(s => s.scorePercentage || 0) : [0]),
                scorePercentage
            );

            const updateData: any = {
                lastAttemptAt: new Date(),
                lastScore: scorePercentage,
                bestScore: bestScore,
                bestScorePercentage: bestScore
            };

            // Eğer geçtiyse ve ilk kez geçiyorsa status'u completed yap
            if (isPassed && assignment.status !== 'completed') {
                updateData.status = 'completed';
                updateData.completedAt = new Date();
            }

            await ctx.service('userQuizAssignments').update(assignment._id, updateData);
        }

        ctx.body = {
            success: true,
            data: {
                sessionId: session.sessionId,
                scorePercentage,
                totalPoints,
                maxPossiblePoints: session.maxPossiblePoints,
                correctAnswers,
                totalQuestions: session.totalQuestions,
                isPassed,
                passed: isPassed, // Backward compatibility
                totalTimeSpent
            },
            message: 'Quiz başarıyla tamamlandı'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            error: 'Quiz tamamlanırken bir hata oluştu',
            details: error.message
        };
    }
}
