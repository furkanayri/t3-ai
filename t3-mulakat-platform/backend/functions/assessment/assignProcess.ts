import { Context } from 'koa';

export default async function assignProcess(ctx: Context) {
    const { tenantId, processId } = ctx.params;
    const { userIds, dueDate } = ctx.request.body as { userIds: string[], dueDate?: string };
    const assignedBy = ctx.state.user?._id;

    const process = await ctx.service('assessmentProcess').findOne({ _id: processId, tenantId });
    if (!process) ctx.throw(404, 'Degerlendirme sureci bulunamadi');

    const results: { success: any[]; failed: any[] } = { success: [], failed: [] };

    for (const userId of (userIds || [])) {
        try {
            const existing = await ctx.service('assessmentAssignment').findOne({
                userId,
                assessmentProcessId: processId,
                status: { $in: ['assigned', 'in-progress'] },
            });
            if (existing) {
                results.failed.push({ userId, error: 'Bu surec kullaniciya zaten atanmis' });
                continue;
            }
            const assignment = await ctx.service('assessmentAssignment').create({
                userId,
                assessmentProcessId: processId,
                tenantId,
                assignedBy,
                assignedAt: new Date(),
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'assigned',
            } as any);
            results.success.push({ userId, assignmentId: assignment._id });
        } catch (error: any) {
            results.failed.push({ userId, error: error.message || 'Bilinmeyen hata' });
        }
    }

    ctx.body = { success: true, results };
}
