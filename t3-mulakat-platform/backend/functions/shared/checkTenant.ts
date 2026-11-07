export default async function checkTenant(ctx: Context) {
    const { tenantId } = ctx.params;

    if (!tenantId) throw new Error("resource is required")

    const tenant = await ctx.service("tenants").findOne({ _id: tenantId })

    if (!tenant) throw new Error("resource not found")

    if (!tenant || tenant.status !== "active") {
        throw new Error('You do not have permission to access this resource');
    }

    const isExistMember = await ctx.service("tenantMembers").findOne({
        tenantId,
        userId: ctx.state.user?._id?.toString(),
    })

    if (!isExistMember) {
        throw new Error('You do not have permission to access this resource');
    }
    const user = ctx.state.user

    if (user?.status !== "active" || isExistMember?.status !== "active") {
        throw new Error('You do not have permission to access this resource');
    }

    ctx.state.tenant = tenant;
};