import { Context } from 'koa';

export default async function createAssessmentProcess(ctx: Context) {
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId, stagesSort: [] };
    const assessmentProcess = await ctx.service('assessmentProcess').create(payload);
    ctx.body = { assessmentProcess };
}
