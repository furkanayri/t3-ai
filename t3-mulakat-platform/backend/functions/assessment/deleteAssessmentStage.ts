import { Context } from 'koa';

export default async function deleteAssessmentStage(ctx: Context) {
    const { tenantId, processId, stageId } = ctx.params;
    const { user } = ctx.state;

    await ctx.service('assessmentStage').softDelete(
        { tenantId, _id: stageId },
        user?._id
    );

    await ctx.service('assessmentProcess').updateOne(
        { _id: processId, tenantId },
        { $pull: { stagesSort: stageId } }
    );

    ctx.body = { isSuccess: true };
}
