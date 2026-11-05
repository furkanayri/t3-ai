import { Context } from 'koa';

// Quiz set detayı getirme
export default async function getQuizSetById(ctx: Context) {
    try {
        const { quizSetId } = ctx.params;

        const quizSet = await ctx.service('quizSets').findOne({
            _id: quizSetId,
            tenantId: ctx.params.tenantId
        });

        if (!quizSet) {
            ctx.status = 404;
            ctx.body = { 
                error: 'Quiz set bulunamadı' 
            };
            return;
        }

        // Quiz set'teki soruları getir
        const questions = await ctx.service('quizQuestions').findAll({
            _id: { $in: quizSet.questionIds || [] },
            tenantId: ctx.params.tenantId
        });

        // İstatistikleri hesapla
        const stats: any = {
            totalQuestions: quizSet.questionIds?.length || 0,
            activeQuestions: questions.results.filter((q: any) => q.isActive).length,
            totalAssignments: await ctx.service('userQuizAssignments').count({
                quizSetId: quizSet._id,
                isActive: true
            }),
            totalSessions: await ctx.service('quizSessions').count({
                quizSetId: quizSet._id
            }),
            completedSessions: await ctx.service('quizSessions').count({
                quizSetId: quizSet._id,
                status: 'completed'
            })
        };

        // Soru detaylarını hesapla
        const questionDetails = questions.results.map((question: any) => ({
            _id: question._id,
            title: question.title,
            difficulty: question.difficulty,
            points: question.points,
            timeLimit: question.timeLimit,
            isActive: question.isActive
        }));

        // Geçme oranını hesapla
        if (stats.completedSessions > 0) {
            const passedSessions = await ctx.service('quizSessions').count({
                quizSetId: quizSet._id,
                status: 'completed',
                passed: true
            });
            stats.passRate = Math.round((passedSessions / stats.completedSessions) * 100);
        } else {
            stats.passRate = 0;
        }

        ctx.body = {
            success: true,
            data: {
                ...quizSet,
                questions: questionDetails,
                statistics: stats
            },
            message: 'Quiz set detayı başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Quiz set detayı getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}