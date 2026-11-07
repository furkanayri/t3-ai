export default async function getOne(ctx: Context) {
    const { tenantId, channelId } = ctx.params

    const channel = await ctx.service('postingChannels').findById(channelId)

    if (!channel) ctx.throw(401, "Invalid channel Id")

    ctx.body = { channel }
}