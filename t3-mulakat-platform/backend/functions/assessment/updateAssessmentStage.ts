import { Context } from 'koa';

export default async function updateAssessmentStage(ctx: Context) {
    const { tenantId, processId, stageId } = ctx.params;
    const payload = { ...ctx.request.body, tenantId, assessmentProcessId: processId };
    const stage = await ctx.service('assessmentStage').updateOne(
        { _id: stageId, tenantId, assessmentProcessId: processId },
        payload
    );
    ctx.body = { stage };
}
