import { Context } from 'koa';

// Quiz başlatma
export default async function startQuiz(ctx: Context) {
    try {
        const { assignmentId } = ctx.params;

        if (!assignmentId) {
            ctx.status = 400;
            ctx.body = { error: 'Atama ID zorunludur' };
            return;
        }

        // Assignment'ı bul
        const assignment = await ctx.service('userQuizAssignments').findOne({
            _id: assignmentId,
            tenantId: ctx.params.tenantId
        }, {
            populate: [{ path: 'quizSetId' }]
        });

        if (!assignment) {
            ctx.status = 404;
            ctx.body = { error: 'Atama bulunamadı' };
            return;
        }

        // Status kontrolü
        if (assignment.status === 'completed') {
            ctx.status = 400;
            ctx.body = { error: 'Bu quiz zaten tamamlanmış' };
            return;
        }

        if (assignment.status === 'cancelled') {
            ctx.status = 400;
            ctx.body = { error: 'Bu quiz iptal edilmiş' };
            return;
        }

        // Max attempts kontrolü
        const quizSet = assignment.quizSetId;
        if (!quizSet.allowRetake && assignment.attempts > 0) {
            ctx.status = 400;
            ctx.body = { error: 'Bu quiz için tekrar alma izni yok' };
            return;
        }

        if (assignment.attempts >= quizSet.maxAttempts) {
            ctx.status = 400;
            ctx.body = { error: 'Maksimum deneme sayısına ulaşıldı' };
            return;
        }

        // Due date kontrolü
        if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
            await ctx.service('userQuizAssignments').update(assignmentId, {
                status: 'overdue'
            });
            ctx.status = 400;
            ctx.body = { error: 'Son teslim tarihi geçmiş' };
            return;
        }

        // Session ID oluştur
        const sessionId = `${assignmentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Quiz session oluştur
        const sessionData = {
            userId: assignment.userId,
            quizSetId: assignment.quizSetId._id,
            assignmentId: assignment._id,
            tenantId: ctx.params.tenantId,
            sessionId,
            attemptNumber: assignment.attempts + 1,
            totalQuestions: quizSet.totalQuestions,
            answeredQuestions: 0,
            correctAnswers: 0,
            totalPoints: 0,
            maxPossiblePoints: quizSet.totalPoints,
            scorePercentage: 0,
            totalTimeSpent: 0,
            timeLimit: quizSet.timeLimit ? quizSet.timeLimit * 60 : null, // dakikayı saniyeye çevir
            status: 'active',
            startedAt: new Date()
        };

        const session = await ctx.service('quizSessions').create(sessionData);

        // Assignment'ı güncelle
        await ctx.service('userQuizAssignments').update(assignmentId, {
            status: 'started',
            startedAt: assignment.startedAt || new Date(),
            attempts: assignment.attempts + 1,
            lastAttemptAt: new Date()
        });

        ctx.body = {
            success: true,
            data: {
                session,
                quizSet: {
                    _id: quizSet._id,
                    title: quizSet.title,
                    description: quizSet.description,
                    instructions: quizSet.instructions,
                    totalQuestions: quizSet.totalQuestions,
                    totalPoints: quizSet.totalPoints,
                    timeLimit: quizSet.timeLimit,
                    passingScore: quizSet.passingScore,
                    difficulty: quizSet.difficulty,
                    shuffleQuestions: quizSet.shuffleQuestions,
                    shuffleOptions: quizSet.shuffleOptions,
                    questionIds: quizSet.questionIds
                }
            },
            message: 'Quiz başarıyla başlatıldı'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Quiz başlatılırken bir hata oluştu',
            details: error.message 
        };
    }
}
