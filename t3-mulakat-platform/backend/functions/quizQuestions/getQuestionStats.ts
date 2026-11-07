// Soru istatistikleri
export default async function getQuestionStats(ctx: Context) {
    try {
        const { dateFrom, dateTo } = ctx.query;

        // Temel istatistikler
        const stats = await ctx.service('quizQuestions').getQuestionStats(
            ctx.params.tenantId
        );

        // Kategori bazında dağılım
        const categoryStats = await ctx.service('quizQuestions').aggregate([
            { 
                $match: { 
                    tenantId: ctx.params.tenantId, 
                    isActive: true 
                } 
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$category.name',
                    count: { $sum: 1 },
                    totalPoints: { $sum: '$points' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Tag istatistikleri
        const tagStats = await ctx.service('quizQuestions').aggregate([
            { 
                $match: { 
                    tenantId: ctx.params.tenantId, 
                    isActive: true,
                    tags: { $exists: true, $ne: [] }
                } 
            },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        ctx.body = {
            success: true,
            data: {
                overview: stats[0] || {
                    totalQuestions: 0,
                    easyCount: 0,
                    mediumCount: 0,
                    hardCount: 0,
                    totalPoints: 0,
                    avgPoints: 0
                },
                categoryDistribution: categoryStats,
                popularTags: tagStats
            },
            message: 'Soru istatistikleri başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Soru istatistikleri getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}