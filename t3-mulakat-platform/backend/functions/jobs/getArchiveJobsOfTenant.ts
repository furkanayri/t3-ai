export default async function getAllJobsOfTenant(ctx: Context) {
    const { tenantId } = ctx.params;
    const { page, limit, status } = ctx.query;




    const pagination = {
        page: page || 1,
        limit: limit || Infinity,
        sort: "-createdAt",

    };

    const jobs = await ctx.service('archiveJobs').findAll({
        tenantId: tenantId,
        ...pagination
    });
    ctx.body = jobs
}