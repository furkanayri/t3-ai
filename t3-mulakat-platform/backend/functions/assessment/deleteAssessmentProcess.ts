import { Context } from 'koa';

export default async function deleteAssessmentProcess(ctx: Context) {
    const { tenantId, processId } = ctx.params;
    const { user } = ctx.state;
    const isSuccess = await ctx.service('assessmentProcess').softDelete(
        { tenantId, _id: processId },
        user?._id
    );
    ctx.body = { isSuccess };
}
