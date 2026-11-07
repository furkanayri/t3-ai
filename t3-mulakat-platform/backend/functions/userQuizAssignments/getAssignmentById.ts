import { Context } from 'koa';

// Atama detayını getirme
export default async function getAssignmentById(ctx: Context) {
    try {
        const { assignmentId } = ctx.params;

        if (!assignmentId) {
            ctx.status = 400;
            ctx.body = { error: 'Atama ID zorunludur' };
            return;
        }

        const assignment = await ctx.service('userQuizAssignments').findOne(
            {
                _id: assignmentId,
                tenantId: ctx.params.tenantId
            },
            {
                populate: [
                    { path: 'quizSetId', select: 'title description totalQuestions totalPoints timeLimit passingScore difficulty questionIds' },
                    { path: 'userId', select: 'firstName lastName email' },
                    { path: 'assignedBy', select: 'firstName lastName email' }
                ]
            }
        );

        if (!assignment) {
            ctx.status = 404;
            ctx.body = { error: 'Atama bulunamadı' };
            return;
        }

        ctx.body = {
            success: true,
            data: assignment,
            message: 'Atama başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Atama getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}
