import { Context } from 'koa';

// Tüm quiz setleri getirme
export default async function getAllQuizSets(ctx: Context) {
    try {
        const { 
            page = 1, 
            limit = 10, 
            isActive,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = ctx.query;

        const filter: any = {
            tenantId: ctx.params.tenantId
        };

        // Filtreleme
        if (isActive !== undefined) filter.isActive = isActive;
        
        // Arama
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pagination = {
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString()),
            sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
        };

        const quizSets = await ctx.service('quizSets').findAll(filter, pagination);

        // Her set için soru sayısını ve istatistikleri hesapla
        const enrichedResults = await Promise.all(
            quizSets.results.map(async (set: any) => {
                const questionCount = set.questionIds?.length || 0;
                
                // Assignment sayısını al
                const assignmentCount = await ctx.service('userQuizAssignments').count({
                    quizSetId: set._id,
                    isActive: true
                });

                // Session sayısını al
                const sessionCount = await ctx.service('quizSessions').count({
                    quizSetId: set._id,
                    status: 'completed'
                });

                return {
                    ...set.toObject(),
                    questionCount,
                    assignmentCount,
                    sessionCount
                };
            })
        );

        ctx.body = {
            success: true,
            data: {
                ...quizSets,
                results: enrichedResults
            },
            message: 'Quiz setleri başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Quiz setleri getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}