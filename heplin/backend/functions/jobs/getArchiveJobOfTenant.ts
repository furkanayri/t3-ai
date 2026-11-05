export default async function getAllJobsOfTenant(ctx: Context) {
    const { tenantId, jobId } = ctx.params;
    const query = {
        tenantId: tenantId,
        _id: jobId,
        isDeleted: { $ne: true }
    };

    const job = await ctx.service('archiveJobs').findOne(query, {
        populate: [

            { path: "categoryId", select: "_id name" },
            // { path: 'aiInterviewConfig', select: 'name interview' },
            // { path: 'videoInterviewId', select: 'name interview' }
        ]
    });
    ctx.body = { job };
}