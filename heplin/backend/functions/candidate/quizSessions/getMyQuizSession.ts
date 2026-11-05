import { Context } from 'koa';

// Candidate'in quiz session bilgilerini getirme
export default async function getMyQuizSession(ctx: Context) {
    try {
        const { sessionId } = ctx.params;
        const userId = ctx.state.user._id;

        if (!sessionId) {
            ctx.status = 400;
            ctx.body = { error: 'Session ID zorunludur' };
            return;
        }

        // Session'ı bul ve kullanıcının kendisine ait olduğunu kontrol et
        const session = await ctx.service('quizSessions').findOne({
            sessionId: sessionId,
            userId: userId
        }, {
            populate: [
                { path: 'quizSetId', select: 'title description totalQuestions totalPoints timeLimit passingScore difficulty shuffleQuestions shuffleOptions questionIds' },
                { path: 'assignmentId', select: 'dueDate priority' }
            ]
        });

        if (!session) {
            ctx.status = 404;
            ctx.body = { error: 'Session bulunamadı veya size ait değil' };
            return;
        }

        // Soruları getir
        const questions = await ctx.service('quizQuestions').findAll({
            _id: { $in: session.quizSetId.questionIds }
        }, {
            select: '-correctAnswer -explanation' // Doğru cevabı ve açıklamayı gizle
        });

        ctx.body = {
            success: true,
            data: {
                session,
                questions
            },
            message: 'Session başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            error: 'Session getirilirken bir hata oluştu',
            details: error.message
        };
    }
}
