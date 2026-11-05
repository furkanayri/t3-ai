export default async function populatePostingChannels(ctx: Context) {
    const populateIds = ctx.request.body.populateIds
    const populatedChannels = await ctx.service('postingChannels').findAll(
        { _id: { $in: populateIds } },

    )
    ctx.body = populatedChannels
}