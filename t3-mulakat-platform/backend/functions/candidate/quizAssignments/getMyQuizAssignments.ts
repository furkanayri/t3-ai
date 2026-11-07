import { Context } from 'koa';

// Candidate'in kendi quiz atamalarını getirme
export default async function getMyQuizAssignments(ctx: Context) {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            sortBy = 'assignedAt',
            sortOrder = 'desc'
        } = ctx.query;

        const userId = ctx.state.user._id;

        if (!userId) {
            ctx.status = 401;
            ctx.body = { error: 'Kullanıcı kimliği doğrulanamadı' };
            return;
        }

        const filter: any = {
            userId
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
        console.log('Filter:', filter);
        const assignments = await ctx.service('userQuizAssignments').findAll(filter, pagination);
        console.log('Assignments:', assignments);
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
