export default async function deleteJob(ctx: Context) {
    const { tenantId, jobId } = ctx.params;
    const { user } = ctx.state;

    const job = await ctx.service('jobs').softDelete({
        tenantId,
        _id: jobId,
    }, user?._id);
    ctx.body = { isSuccess: job };
}