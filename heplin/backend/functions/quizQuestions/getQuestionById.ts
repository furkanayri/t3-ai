// Tek soru getirme
export default async function getQuestionById(ctx: Context) {
    try {
        const { questionId } = ctx.params;

        const question = await ctx.service('quizQuestions').findOne({
            _id: questionId,
            tenantId: ctx.params.tenantId
        }, {
            // populate işlemleri geçici olarak kaldırıldı - model referans sorunları nedeniyle
        });

        if (!question) {
            ctx.status = 404;
            ctx.body = { 
                error: 'Soru bulunamadı' 
            };
            return;
        }

        ctx.body = {
            success: true,
            data: question,
            message: 'Soru başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Soru getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}