import { Context } from 'koa';

// Candidate'in quiz sonuçlarını getirme
export default async function getMySessionResults(ctx: Context) {
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
            populate: [
                { path: 'quizSetId', select: 'title description totalQuestions totalPoints passingScore difficulty' },
                { path: 'assignmentId', select: 'priority dueDate' }
            ]
        });

        if (!session) {
            ctx.status = 404;
            ctx.body = { error: 'Session bulunamadı veya size ait değil' };
            return;
        }

        if (session.status !== 'completed') {
            ctx.status = 400;
            ctx.body = { error: 'Bu quiz henüz tamamlanmamış' };
            return;
        }

        // Tüm cevapları getir
        const answers = await ctx.service('userQuizAnswers').findAll({
            sessionId: session._id
        }, {
            populate: [{ path: 'questionId' }]
        });

        console.log('getMySessionResults - Session ID:', session._id);
        console.log('getMySessionResults - Answers found:', answers.data?.length || 0);
        console.log('getMySessionResults - Raw answers:', answers);

        // Cevapları detaylı formatta hazırla
        const detailedAnswers = answers.data?.map(answer => {
            const question = answer.questionId;
            const selectedOption = question.options?.find(opt => opt.optionId === answer.answer || opt.id === answer.answer);
            const correctOption = question.options?.find(opt => opt.optionId === question.correctAnswer || opt.id === question.correctAnswer);
            
            return {
                questionId: question._id,
                question: question.questionText || question.question,
                questionType: question.questionType,
                options: question.options?.map(opt => ({
                    id: opt.optionId || opt.id,
                    text: opt.text,
                    isCorrect: opt.optionId === question.correctAnswer || opt.id === question.correctAnswer
                })) || [],
                selectedOptionId: answer.answer,
                selectedOptionText: selectedOption?.text || answer.answer,
                correctOptionText: correctOption?.text || question.correctAnswer,
                isCorrect: answer.isCorrect,
                earnedPoints: answer.points,
                maxPoints: question.points,
                explanation: question.explanation,
                timeSpent: answer.timeSpent
            };
        }) || [];

        ctx.body = {
            success: true,
            data: {
                session: {
                    sessionId: session.sessionId,
                    attemptNumber: session.attemptNumber,
                    status: session.status,
                    scorePercentage: session.scorePercentage,
                    totalPoints: session.totalPoints,
                    maxPossiblePoints: session.maxPossiblePoints,
                    correctAnswers: session.correctAnswers,
                    totalQuestions: session.totalQuestions,
                    answeredQuestions: session.answeredQuestions,
                    isPassed: session.isPassed !== undefined ? session.isPassed : session.passed,
                    passingScore: session.quizSetId?.passingScore || 70,
                    totalTimeSpent: session.totalTimeSpent,
                    timeLimit: session.timeLimit,
                    startedAt: session.startedAt,
                    completedAt: session.completedAt
                },
                quizSet: session.quizSetId,
                assignment: session.assignmentId,
                answers: detailedAnswers
            },
            message: 'Sonuçlar başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            error: 'Sonuçlar getirilirken bir hata oluştu',
            details: error.message
        };
    }
}
