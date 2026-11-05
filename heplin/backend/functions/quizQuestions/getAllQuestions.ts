// Tüm soruları getirme
export default async function getAllQuestions(ctx: Context) {
    try {
        const { 
            page = 1, 
            limit = 10, 
            difficulty, 
            tag, 
            isActive,
            search 
        } = ctx.query;

        const filter: any = {
            tenantId: ctx.params.tenantId
        };

        // Filtreleme
        if (isActive !== undefined) filter.isActive = isActive;
        if (difficulty) filter.difficulty = difficulty;
        if (tag) filter.tags = { $in: [tag] };
        
        // Arama
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { question: { $regex: search, $options: 'i' } }
            ];
        }

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
            message: 'Sorular başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Sorular getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}