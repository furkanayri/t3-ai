// Soru güncelleme
export default async function updateQuestion(ctx: Context) {
    try {
        const { questionId } = ctx.params;
        const payload = {
            ...ctx.request.body,
            updatedBy: ctx.state.user?._id
        };

        // CategoryId'yi temizle - boş string ise undefined yap
        if (payload.categoryId === '' || payload.categoryId === null) {
            delete payload.categoryId;
        }

        // Tags'i temizle - boş array veya undefined ise
        if (!payload.tags || (Array.isArray(payload.tags) && payload.tags.length === 0)) {
            delete payload.tags;
        }

        // Description'ı temizle - boş string ise
        if (payload.description === '' || payload.description === null) {
            delete payload.description;
        }

        // Explanation'ı temizle - boş string ise
        if (payload.explanation === '' || payload.explanation === null) {
            delete payload.explanation;
        }

        // TimeLimit'i temizle - 0 veya boş ise
        if (!payload.timeLimit || payload.timeLimit <= 0) {
            delete payload.timeLimit;
        }

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

        // Validasyon
        if (payload.options && payload.options.length < 2) {
            ctx.status = 400;
            ctx.body = { 
                error: 'En az 2 şık gereklidir' 
            };
            return;
        }

        // Doğru cevap kontrolü
        if (payload.options) {
            const hasCorrectAnswer = payload.options.some((opt: any) => opt.isCorrect === true);
            if (!hasCorrectAnswer) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'En az bir şık doğru olarak işaretlenmelidir' 
                };
                return;
            }

            // Option ID'leri kontrol et
            payload.options = payload.options.map((opt: any, index: number) => ({
                ...opt,
                optionId: opt.optionId || String.fromCharCode(97 + index)
            }));
        }

        const updatedQuestion = await ctx.service('quizQuestions').update(
            questionId,
            payload
        );

        ctx.body = {
            success: true,
            data: updatedQuestion,
            message: 'Soru başarıyla güncellendi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Soru güncellenirken bir hata oluştu',
            details: error.message 
        };
    }
}