export default async function updateOneMember(ctx: Context) {
    const payload = ctx.request.body

    const res = await ctx.service("users").updateOne(
        { _id: payload.userId },
        payload,
    );

    ctx.body = { user: res }
}