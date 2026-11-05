import { Context } from 'koa';

// Kullanıcının quiz atamalarını getirme
export default async function getUserAssignments(ctx: Context) {
    try {
        const { 
            page = 1, 
            limit = 10,
            status,
            priority,
            sortBy = 'assignedAt',
            sortOrder = 'desc'
        } = ctx.query;

        const { userId } = ctx.params;

        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: 'Kullanıcı ID zorunludur' };
            return;
        }

        const filter: any = {
            userId,
            tenantId: ctx.params.tenantId
        };

        // Filtreleme
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const pagination = {
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString()),
            sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
            populate: [
                { path: 'quizSetId', select: 'title description totalQuestions totalPoints timeLimit passingScore difficulty' },
                { path: 'assignedBy', select: 'firstName lastName email' }
            ]
        };

        const assignments = await ctx.service('userQuizAssignments').findAll(filter, pagination);

        ctx.body = {
            success: true,
            data: assignments,
            message: 'Atamalar başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Atamalar getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}
