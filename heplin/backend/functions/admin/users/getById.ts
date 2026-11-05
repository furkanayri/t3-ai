export default async function getById(ctx: Context) {
    const userId = ctx.params.userId

    const res = await ctx.service("users").findOne({_id: userId})

    ctx.body = { user: res }
}