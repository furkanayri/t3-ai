// Kategoriye göre sorular
export default async function getQuestionsByCategory(ctx: Context) {
    try {
        const { categoryId } = ctx.params;
        const { 
            page = 1, 
            limit = 10, 
            difficulty,
            isActive = true 
        } = ctx.query;

        const filter: any = {
            tenantId: ctx.params.tenantId,
            categoryId,
            isActive
        };

        if (difficulty) filter.difficulty = difficulty;

        const pagination = {
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString()),
            sort: "-createdAt"
        };

        const questions = await ctx.service('quizQuestions').findAll(filter, {
            // populate işlemleri geçici olarak kaldırıldı - model referans sorunları nedeniyle
        });

        ctx.body = {
            success: true,
            data: questions,
            message: 'Kategori soruları başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Kategori soruları getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}