export default async function myLanguages(ctx: Context) {
    const userId = ctx.state.user._id;

    const languages = await ctx.service("candidateLanguages").findAll({
        userId
    });

    ctx.body = languages;
}
