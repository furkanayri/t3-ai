import { Context } from 'koa';

// Atama güncelleme (sadece admin/yönetici için)
export default async function updateAssignment(ctx: Context) {
    try {
        const { assignmentId } = ctx.params;
        const {
            dueDate,
            status,
            notes,
            priority
        } = ctx.request.body;

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

        // Güncellenecek alanlar
        const updateData: any = {
            updatedBy: ctx.state.user?._id
        };

        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (status !== undefined) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes?.trim();
        if (priority !== undefined) updateData.priority = priority;

        // Status'e göre özel güncellemeler
        if (status === 'cancelled') {
            updateData.completedAt = new Date();
        }

        const updatedAssignment = await ctx.service('userQuizAssignments').update(assignmentId, updateData);

        ctx.body = {
            success: true,
            data: updatedAssignment,
            message: 'Atama başarıyla güncellendi'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Atama güncellenirken bir hata oluştu',
            details: error.message 
        };
    }
}
