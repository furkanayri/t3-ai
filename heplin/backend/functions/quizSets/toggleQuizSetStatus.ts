import { Context } from 'koa';

// Quiz set aktif/pasif yapma
export default async function toggleQuizSetStatus(ctx: Context) {
    try {
        const { quizSetId } = ctx.params;
        const { isActive } = ctx.request.body;

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

        // Eğer pasif yapılıyorsa, aktif assignment kontrolü
        if (isActive === false) {
            const activeAssignments = await ctx.service('userQuizAssignments').findAll({
                quizSetId: quizSetId,
                status: { $in: ['pending', 'in-progress'] },
                isActive: true
            });

            if (activeAssignments.results && activeAssignments.results.length > 0) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Bu quiz set pasif yapılamaz',
                    reason: 'Aktif atamalar bulunuyor',
                    activeAssignments: activeAssignments.results.map((assignment: any) => ({
                        id: assignment._id,
                        userId: assignment.userId,
                        status: assignment.status,
                        assignedAt: assignment.assignedAt
                    }))
                };
                return;
            }

            const activeSession = await ctx.service('quizSessions').findAll({
                quizSetId: quizSetId,
                status: { $in: ['started', 'paused'] }
            });

            if (activeSession.results && activeSession.results.length > 0) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Bu quiz set pasif yapılamaz',
                    reason: 'Devam eden oturumlar bulunuyor',
                    activeSessions: activeSession.results.length
                };
                return;
            }
        }

        const updatedSet = await ctx.service('quizSets').update(
            quizSetId,
            { 
                isActive,
                updatedBy: ctx.state.user?._id,
                updatedAt: new Date()
            }
        );

        ctx.body = {
            success: true,
            data: updatedSet,
            message: `Quiz set başarıyla ${isActive ? 'aktif' : 'pasif'} yapıldı`
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Quiz set durumu güncellenirken bir hata oluştu',
            details: error.message 
        };
    }
}