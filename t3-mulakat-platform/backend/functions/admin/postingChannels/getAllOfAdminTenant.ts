export default async function getAllOfAdminTenant(ctx: Context) {
    const adminTenantId = ctx.params.adminTenantId
    const tenantMember = await ctx.service("tenantMembers").findOne({
        userId: ctx.state.user._id?.toString(),
        tenantId: adminTenantId
    })
    if (!tenantMember) return ctx.throw(403, "You're not member of the tenant!")

    const { tenantId } = ctx.query

    const subTenants = await ctx.service('tenants').findAll({ parentTenantId: adminTenantId })

    let query: any = {}
    if (!tenantId) query.tenantId = { $in: [adminTenantId, ...subTenants?.results?.map(st => st._id?.toString())] }

    if (tenantId) query.tenantId = tenantId

    const res = await ctx.service('postingChannels').findAll(query,
        {
            populate: [{ path: "tenantId", select: "name email" }]
        }
    )

    ctx.body = res
}