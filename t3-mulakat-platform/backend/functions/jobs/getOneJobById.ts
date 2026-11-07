export default async function getOneJobById(ctx: Context) {
    const { jobId } = ctx.params;

    if (!jobId) {
        return ctx.throw(400, "Job id is required");
    }

    const job: any = await ctx.service("jobs").findOne({
        _id: jobId,
        status: "active"
    }, {
        populate: {
            path: 'tenantId',
            select: 'name _id subdomain logo status'
        }
    });

    if (!job) {
        return ctx.throw(400, "Job is not found");
    }

    if (job.tenantId?.status !== 'active') {
        return ctx.throw(400, "Tenant is not active");
    }

    ctx.body = job
}