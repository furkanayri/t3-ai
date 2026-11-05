export default async function getAllCandidatesOfTenant(ctx: Context) {
    const tenantId = ctx.params?.tenantId
    const { page, limit } = ctx.query;
    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };
    const res = await ctx.service('candidates').findAll({
        tenantId,
        ...pagination
    })

    ctx.body = res
}