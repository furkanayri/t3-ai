// Soru silme (soft delete)
export default async function deleteQuestion(ctx: Context) {
    try {
        const { questionId } = ctx.params;

        // Soru varlık kontrolü
        const existingQuestion = await ctx.service('quizQuestions').findOne({
            _id: questionId,
            tenantId: ctx.params.tenantId
        });

        if (!existingQuestion) {
            ctx.status = 404;
            ctx.body = { 
                error: 'Soru bulunamadı' 
            };
            return;
        }

        // Quiz set'lerde kullanılıyor mu kontrol et
        const usedInQuizSets = await ctx.service('quizSets').findAll({
            questionIds: { $in: [questionId] },
            tenantId: ctx.params.tenantId,
            isActive: true
        });

        if (usedInQuizSets.results && usedInQuizSets.results.length > 0) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Bu soru aktif quiz setlerinde kullanıldığı için silinemez',
                usedInSets: usedInQuizSets.results.map((set: any) => set.title)
            };
            return;
        }

        // Soft delete
        await ctx.service('quizQuestions').softDelete(
            questionId,
            ctx.state.user?._id
        );

        ctx.body = {
            success: true,
            message: 'Soru başarıyla silindi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Soru silinirken bir hata oluştu',
            details: error.message 
        };
    }
}