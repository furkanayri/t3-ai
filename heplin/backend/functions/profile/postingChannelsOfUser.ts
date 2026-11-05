export default async function postingChannelsOfUser(ctx: Context) {
    const tenantId = ctx.params.tenantId
    const tenantMember = await ctx.service("tenantMembers").findOne({
        userId: ctx.state.user._id,
        tenantId
    })

    if (!tenantMember) return ctx.throw(403, "You're not member of the tenant!")

    const response = await ctx.service("postingChannels").findAll({ tenantId })

    ctx.body = response
}