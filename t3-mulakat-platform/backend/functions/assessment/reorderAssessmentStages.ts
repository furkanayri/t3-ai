import { Context } from 'koa';

export default async function reorderAssessmentStages(ctx: Context) {
    const { tenantId, processId } = ctx.params;
    const { stagesSort } = ctx.request.body; // sirali stage id dizisi
    const assessmentProcess = await ctx.service('assessmentProcess').updateOne(
        { _id: processId, tenantId },
        { stagesSort }
    );
    ctx.body = { assessmentProcess };
}
