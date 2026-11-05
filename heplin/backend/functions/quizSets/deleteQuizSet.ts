import { Context } from 'koa';

// Quiz set silme
export default async function deleteQuizSet(ctx: Context) {
    try {
        const { quizSetId } = ctx.params;
        const { force = false } = ctx.query;

        // Set varlık kontrolü
        const existingSet = await ctx.service('quizSets').findOne({
            _id: quizSetId,
            tenantId: ctx.params.tenantId
        });

        if (!existingSet) {
            ctx.status = 404;
            ctx.body = { 
                error: 'Quiz set bulunamadı' 
            };
            return;
        }

        // Bağımlılık kontrolü
        const assignments = await ctx.service('userQuizAssignments').count({
            quizSetId: quizSetId,
            isActive: true
        });

        const sessions = await ctx.service('quizSessions').count({
            quizSetId: quizSetId
        });

        if ((assignments > 0 || sessions > 0) && !force) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Bu quiz set silinemiyor',
                reason: 'Set ile ilişkili atamalar veya oturumlar bulunuyor',
                details: {
                    assignments: assignments,
                    sessions: sessions
                },
                suggestion: 'force=true parametresi ile zorla silebilirsiniz (tüm ilişkili veriler de silinecek)'
            };
            return;
        }

        // Force silme - ilişkili verileri de sil
        if (force && (assignments > 0 || sessions > 0)) {
            // İlişkili verileri sil
            await Promise.all([
                // Assignment'ları sil
                ctx.service('userQuizAssignments').deleteMany({
                    quizSetId: quizSetId
                }),
                // Session'ları sil
                ctx.service('quizSessions').deleteMany({
                    quizSetId: quizSetId
                }),
                // Quiz answers'ı sil (session'lar üzerinden)
                ctx.service('userQuizAnswers').deleteMany({
                    sessionId: { $in: await getSessionIds(ctx, quizSetId) }
                })
            ]);
        }

        // Quiz set'i sil
        await ctx.service('quizSets').delete(quizSetId);

        ctx.body = {
            success: true,
            message: force 
                ? `Quiz set ve ${assignments + sessions} ilişkili kayıt başarıyla silindi`
                : 'Quiz set başarıyla silindi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Quiz set silinirken bir hata oluştu',
            details: error.message 
        };
    }
}

// Helper function - session ID'lerini al
async function getSessionIds(ctx: any, quizSetId: string) {
    const sessions = await ctx.service('quizSessions').findAll({
        quizSetId: quizSetId
    }, { limit: 10000 });
    
    return sessions.results.map((session: any) => session._id);
}