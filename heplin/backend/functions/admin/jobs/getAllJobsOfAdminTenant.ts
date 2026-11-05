
export default async function getAllJobsOfAdminTenant(ctx: Context) {
    const { adminTenantId } = ctx.params
    const { page, limit, parentTenantId, tenantId, channelId, status, _id, title } = ctx.query;

    const adminTenant = await ctx.service('tenants').findById(adminTenantId)
    if (!adminTenant) ctx.throw(401, "Tenant not found")
    const subTenants = (await ctx.service('tenants').findAll({ parentTenantId: adminTenant?._id }))?.results
    const allTenants = [adminTenant, ...subTenants]

    const query: any = {}

    if (parentTenantId && parentTenantId === adminTenantId?.toString()) {
        query.tenantId = { $in: subTenants?.map(st => st._id) }
    }
    if (parentTenantId === 'null') {
        query.tenantId = adminTenant?._id
    }
    if (!parentTenantId) {
        query.tenantId = { $in: allTenants.map(t => t._id) }
    }

    if (_id) {
        query._id = _id
    }
    if (title) {
        query.title = { $regex: title, $options: 'i' }
    }

    if (tenantId) {
        query.tenantId = tenantId || adminTenant?._id
    }
    if (channelId) {
        query["publishedChannels.channelId"] = channelId
    }
    if (status) {
        if (status === "draft") {
            query.$or = [
                { 'publishedChannels.status': status },
                { 'publishedChannels': { $exists: true, $size: 0 } },
            ]
        }
        else
            query["publishedChannels.status"] = status
    }

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const res = await ctx.service('jobs').findAll({
        ...query,
        ...pagination
    })

    const populatedJobsRes = {
        ...res,
        results: res.results.map(job => {
            const foundTenant = allTenants.find(t => t._id?.toString() === job.tenantId?.toString())
            return {
                ...job.toJSON(),
                tenant: {
                    _id: foundTenant?._id,
                    name: foundTenant?.name,
                    logo: foundTenant?.logo,
                },
            }
        })
    }

    ctx.body = populatedJobsRes
}