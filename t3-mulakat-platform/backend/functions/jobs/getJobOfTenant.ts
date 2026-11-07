export default async function getAllJobsOfTenant(ctx: Context) {
    const { tenantId, jobId } = ctx.params;
    const query = {
        tenantId: tenantId,
        _id: jobId,
        isDeleted: { $ne: true }
    };

    const job = await ctx.service('jobs').findOne(query, {
        populate: [
            { path: "skills", select: "_id name" },
            { path: "categoryId", select: "_id name" },
        ]
    });
    ctx.body = { job };
}