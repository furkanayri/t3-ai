export default async function getAllByTenantId(ctx: Context) {
    const { adminTenantId, tenantId } = ctx.params

    const tenantMember = await ctx.service("tenantMembers").findOne({
        userId: ctx.state.user._id?.toString(),
        tenantId: adminTenantId
    })

    if (!tenantMember) return ctx.throw(403, "You're not member of the tenant!")

    const postingChannels = await ctx.service('postingChannels').findAll(
        { tenantId: tenantId },
        {
            populate: [{ path: "tenantId", select: "name email" }]
        }
    )

    ctx.body = postingChannels
}