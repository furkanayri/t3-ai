export default async function getAllTenantsOfAdminTenant(ctx: Context) {
    const { adminTenantId: tenantId } = ctx.params

    const tenant = await ctx.service('tenants').findById(tenantId)
    if (!tenant) ctx.throw(401, "Tenant not found")

    const subTenants = await ctx.service('tenants').findAll({ parentTenantId: tenant?._id })
    ctx.body = {
        tenant: tenant,
        subTenants: subTenants?.results,
        allTenants: [tenant, ...subTenants?.results]
    }
}