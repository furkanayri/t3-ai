import { Context } from 'koa';

// Atama silme (soft delete)
export default async function deleteAssignment(ctx: Context) {
    try {
        const { assignmentId } = ctx.params;

        if (!assignmentId) {
            ctx.status = 400;
            ctx.body = { error: 'Atama ID zorunludur' };
            return;
        }

        // Mevcut assignment'ı kontrol et
        const existingAssignment = await ctx.service('userQuizAssignments').findOne({
            _id: assignmentId,
            tenantId: ctx.params.tenantId
        });

        if (!existingAssignment) {
            ctx.status = 404;
            ctx.body = { error: 'Atama bulunamadı' };
            return;
        }

        // Soft delete
        await ctx.service('userQuizAssignments').update(assignmentId, {
            isDeleted: true,
            deletedBy: ctx.state.user?._id,
            deletedAt: new Date()
        });

        ctx.body = {
            success: true,
            message: 'Atama başarıyla silindi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Atama silinirken bir hata oluştu',
            details: error.message 
        };
    }
}
