import { Context } from 'koa';
import { cleanQuizQuestionPayload, validateQuizQuestion } from './utils';

// Soru oluşturma
export default async function createQuestion(ctx: Context) {
    try {
        let payload = {
            ...ctx.request.body,
            tenantId: ctx.params.tenantId,
            createdBy: ctx.state.user?._id,
            isActive: true
        };

        // Payload'ı temizle
        payload = cleanQuizQuestionPayload(payload);
        
        // Validasyon
        const validation = validateQuizQuestion(payload);
        if (!validation.isValid) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Validasyon hatası',
                details: validation.errors
            };
            return;
        }

        // Option ID'leri otomatik oluştur
        payload.options = payload.options.map((opt: any, index: number) => ({
            ...opt,
            optionId: opt.optionId || String.fromCharCode(97 + index) // a, b, c, d
        }));

        const question = await ctx.service('quizQuestions').create(payload);
        
        ctx.status = 201;
        ctx.body = {
            success: true,
            data: question,
            message: 'Soru başarıyla oluşturuldu'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Soru oluşturulurken bir hata oluştu',
            details: error.message 
        };
    }
}