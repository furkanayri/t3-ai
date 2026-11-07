import { Context } from 'koa';

export default async function createAssessmentStage(ctx: Context) {
    const { tenantId, processId } = ctx.params;
    const payload = { ...ctx.request.body, assessmentProcessId: processId, tenantId };
    const stage = await ctx.service('assessmentStage').create(payload);

    await ctx.service('assessmentProcess').updateOne(
        { _id: processId, tenantId },
        { $push: { stagesSort: stage._id } }
    );

    ctx.body = { stage };
}
