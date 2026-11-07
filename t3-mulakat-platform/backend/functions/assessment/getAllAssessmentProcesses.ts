import { Context } from 'koa';

export default async function getAllAssessmentProcesses(ctx: Context) {
    const { tenantId } = ctx.params;
    const { page, limit } = ctx.query;
    const result = await ctx.service('assessmentProcess').findAll({
        tenantId,
        isDeleted: { $ne: true },
        page: page || 1,
        limit: limit || 1000,
        sort: '-createdAt',
    } as any);
    ctx.body = result;
}
