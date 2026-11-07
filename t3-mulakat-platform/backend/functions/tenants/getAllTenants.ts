export default async function getAllTenants(ctx: Context) {
    const query: any = {}
    const { page, limit, mainTenants } = ctx.query;
    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };
    if (mainTenants) {
        query.parentTenantId = null
    }
    const response = await ctx.service("tenants").findAll({
        ...query,
        ...pagination
    });

    ctx.body = response
}