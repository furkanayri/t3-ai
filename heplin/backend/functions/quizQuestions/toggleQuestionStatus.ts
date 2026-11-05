// Soruyu aktif/pasif yapma
export default async function toggleQuestionStatus(ctx: Context) {
    try {
        const { questionId } = ctx.params;
        const { isActive } = ctx.request.body;

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

        // Eğer pasif yapılıyorsa, aktif quiz setlerde kullanılıp kullanılmadığını kontrol et
        if (isActive === false) {
            const usedInQuizSets = await ctx.service('quizSets').findAll({
                questionIds: { $in: [questionId] },
                tenantId: ctx.params.tenantId,
                isActive: true
            });

            if (usedInQuizSets.results && usedInQuizSets.results.length > 0) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Bu soru aktif quiz setlerinde kullanıldığı için pasif yapılamaz',
                    usedInSets: usedInQuizSets.results.map((set: any) => set.title)
                };
                return;
            }
        }

        const updatedQuestion = await ctx.service('quizQuestions').update(
            questionId,
            { 
                isActive,
                updatedBy: ctx.state.user?._id
            }
        );

        ctx.body = {
            success: true,
            data: updatedQuestion,
            message: `Soru başarıyla ${isActive ? 'aktif' : 'pasif'} yapıldı`
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Soru durumu güncellenirken bir hata oluştu',
            details: error.message 
        };
    }
}