import { Context } from 'koa';

// Quiz set güncelleme
export default async function updateQuizSet(ctx: Context) {
    try {
        const { quizSetId } = ctx.params;
        const updateData = { ...ctx.request.body };

        // Set varlık kontrolü
        const existingSet = await ctx.service('quizSets').findOne({
            _id: quizSetId,
            tenantId: ctx.params.tenantId
        });

        if (!existingSet) {
            ctx.status = 404;
            ctx.body = { 
                error: 'Quiz set bulunamadı' 
            };
            return;
        }

        // Aktif assignment varsa bazı alanları güncellenmesin
        const activeAssignments = await ctx.service('userQuizAssignments').count({
            quizSetId: quizSetId,
            status: { $in: ['pending', 'in-progress'] },
            isActive: true
        });

        if (activeAssignments > 0) {
            // Kritik alanları güncelleme yasakla
            delete updateData.questionIds;
            delete updateData.passingScore;
            delete updateData.timeLimit;
            delete updateData.maxAttempts;
            
            console.log(`Quiz set has ${activeAssignments} active assignments. Limited update applied.`);
        }

        // Validation
        if (updateData.title && !updateData.title.trim()) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Quiz set başlığı boş olamaz' 
            };
            return;
        }

        // Soru ID'leri güncelleniyorsa kontrol et
        if (updateData.questionIds) {
            if (!Array.isArray(updateData.questionIds) || updateData.questionIds.length === 0) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'En az bir soru seçilmelidir' 
                };
                return;
            }

            // Soruların varlığını kontrol et
            const existingQuestions = await ctx.service('quizQuestions').findAll({
                _id: { $in: updateData.questionIds },
                tenantId: ctx.params.tenantId,
                isActive: true
            });

            if (existingQuestions.results.length !== updateData.questionIds.length) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Seçilen sorulardan bazıları bulunamadı veya aktif değil' 
                };
                return;
            }
        }

        // Veri temizleme
        if (updateData.title) updateData.title = updateData.title.trim();
        if (updateData.description) updateData.description = updateData.description.trim();
        if (updateData.passingScore) updateData.passingScore = Math.max(0, Math.min(100, updateData.passingScore));
        if (updateData.maxAttempts) updateData.maxAttempts = Math.max(1, updateData.maxAttempts);
        
        // Audit alanları
        updateData.updatedBy = ctx.state.user?._id;
        updateData.updatedAt = new Date();

        const updatedQuizSet = await ctx.service('quizSets').update(
            quizSetId,
            updateData
        );

        ctx.body = {
            success: true,
            data: updatedQuizSet,
            message: activeAssignments > 0 
                ? 'Quiz set kısmen güncellendi (aktif atamalar nedeniyle bazı alanlar değiştirilemedi)'
                : 'Quiz set başarıyla güncellendi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Quiz set güncellenirken bir hata oluştu',
            details: error.message 
        };
    }
}