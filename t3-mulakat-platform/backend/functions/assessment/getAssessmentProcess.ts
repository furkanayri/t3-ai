import { Context } from 'koa';

export default async function getAssessmentProcess(ctx: Context) {
    const { tenantId, processId } = ctx.params;

    const assessmentProcess = await ctx.service('assessmentProcess').findOne(
        { tenantId, _id: processId, isDeleted: { $ne: true } },
        { populate: [{ path: 'stagesSort' }] }
    );

    ctx.body = { assessmentProcess };
}
