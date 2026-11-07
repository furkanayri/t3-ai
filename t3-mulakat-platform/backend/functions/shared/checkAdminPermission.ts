export default async function checkAdminPermission(ctx: Context) {
    const tenantId = ctx.params.adminTenantId
    const user = ctx.state?.user
    console.log(tenantId)
    if (!tenantId || !user) ctx.throw(404, "invalid request, user id or tenant id is missing")
    const permission = await ctx.service('permissions').findOne({
        userId: user?._id?.toString(),
        allowed: true,
        scope: "access_admin_panel",
        $or: [
            { "resource.tenantId": "*" },
            { "resource.tenantId": { $in: [tenantId] } }
        ]
    })
    console.log({ permission })
    if (!permission) ctx.throw(404, "You are not allowed to access this route")

    ctx.state.hasAdminAccess = true
}