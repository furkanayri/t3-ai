export default async function updatePostingChannel(ctx: Context) {
    const { adminTenantId: tenantId, channelId } = ctx.params

    const parentTenant = await ctx.service('tenants').findById(tenantId)
    if (parentTenant.parentTenantId) ctx.throw(401, "You are not allowed to update posting channels")

    const res = await ctx.service("postingChannels").softDelete(channelId, ctx.state?.user?._id)

    ctx.body = { isSuccess: true }
}