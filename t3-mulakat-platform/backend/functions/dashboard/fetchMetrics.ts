export default async function fetchMetrics(ctx: Context) {
    const { tenantId } = ctx.params;

    const totalJobs = await ctx.service("jobs").count({
        tenantId
    })

    const totalCandidates = await ctx.service("candidates").count({
        tenantId
    })

    const totalApplications = await ctx.service("jobApplications").count({
        tenantId
    })


    ctx.body = {
        totalJobs,
        totalCandidates,
        totalApplications
    }
};