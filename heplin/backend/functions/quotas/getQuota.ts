export default async function getQuota(ctx: Context) {
    const { tenantId } = ctx.params
    const quota = await (await ctx.service('quotas').findOne({ tenantId: tenantId })).populate({
        path: 'jobApplications.jobId',
        select: 'title'
    });
    ctx.body = quota
}