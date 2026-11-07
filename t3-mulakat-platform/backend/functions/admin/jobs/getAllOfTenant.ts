export default async function getAllOfTenant(ctx: Context) {
    const { tenantId } = ctx.params;

    const { filter_tenantId, filter_channelId, status, page, limit } = ctx.query;

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };
    
    const tenant = await ctx.service('tenants').findById(tenantId)
    if (!tenant) ctx.throw(401, "Tenant not found")
    const subTenants = (await ctx.service('tenants').findAll({ parentTenantId: tenant?._id })).results

    const query: any = { isDeleted: { $ne: true } }
    if (!filter_tenantId && !filter_channelId) {
        query.tenantId = { $in: [tenant?._id, ...subTenants?.map((st) => st?._id)] }
    }

    if (filter_tenantId) {
        query.tenantId = filter_tenantId
    }

    if (filter_channelId) {
        query["publishedChannels.channelId"] = filter_channelId
    }
    if (status) {
        query["publishedChannels.status"] = status
    }

    const jobs = await ctx.service('jobs').findAll({
        ...query,
        ...pagination
    })

    ctx.body = jobs


    // const { page, limit } = ctx.query;
    // const options = {
    //     page: page || 1,
    //     limit: limit || 10,
    //     sort: { createdAt: -1 },
    // };

}