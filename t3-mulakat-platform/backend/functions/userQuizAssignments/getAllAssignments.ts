import { Context } from 'koa';

// Tüm atamaları getirme (admin/yönetici için)
export default async function getAllAssignments(ctx: Context) {
    try {
        const { 
            page = 1, 
            limit = 10,
            status,
            priority,
            userId,
            quizSetId,
            search,
            sortBy = 'assignedAt',
            sortOrder = 'desc'
        } = ctx.query;

        const filter: any = {
            tenantId: ctx.params.tenantId
        };

        // Filtreleme
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (userId) filter.userId = userId;
        if (quizSetId) filter.quizSetId = quizSetId;

        const pagination = {
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString()),
            sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
            populate: [
                { path: 'quizSetId', select: 'title description totalQuestions totalPoints timeLimit passingScore difficulty' },
                { path: 'userId', select: 'firstName lastName email' },
                { path: 'assignedBy', select: 'firstName lastName email' }
            ]
        };

        // Arama
        if (search) {
            // Populate yapılmış alanlar üzerinde arama yapılamayacağı için önce kullanıcı ara
            const users = await ctx.service('users').findAll({
                tenantId: ctx.params.tenantId,
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            });

            const userIds = users.results.map((u: any) => u._id);
            if (userIds.length > 0) {
                filter.userId = { $in: userIds };
            }
        }

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
