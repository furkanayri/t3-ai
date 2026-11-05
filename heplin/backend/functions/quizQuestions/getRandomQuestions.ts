import { Types } from "mongoose";

// Rastgele sorular
export default async function getRandomQuestions(ctx: Context) {
    try {
        const { 
            count = 5, 
            categoryId, 
            difficulty 
        } = ctx.query;

        const questionCount = Math.min(parseInt(count.toString()), 50); // Max 50 soru

        const questions = await ctx.service('quizQuestions').getRandomQuestions(
            questionCount,
            new Types.ObjectId(ctx.params.tenantId),
            categoryId ? new Types.ObjectId(categoryId.toString()) : undefined
        );

        // Zorluk filtresi
        let filteredQuestions = questions;
        if (difficulty) {
            filteredQuestions = questions.filter((q: any) => q.difficulty === difficulty);
        }

        // Şıkları karıştır (frontend için)
        const shuffledQuestions = filteredQuestions.map((question: any) => ({
            ...question,
            options: question.options.sort(() => Math.random() - 0.5)
        }));

        ctx.body = {
            success: true,
            data: shuffledQuestions,
            count: shuffledQuestions.length,
            message: 'Rastgele sorular başarıyla getirildi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Rastgele sorular getirilirken bir hata oluştu',
            details: error.message 
        };
    }
}