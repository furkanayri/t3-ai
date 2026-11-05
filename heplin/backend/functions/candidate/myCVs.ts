export default async function myCVs(ctx: Context) {
    const userId = ctx.state.user._id;

    const cvs = await ctx.service("cv").findAll({
        userId: userId,
    });

    ctx.body = cvs;
}