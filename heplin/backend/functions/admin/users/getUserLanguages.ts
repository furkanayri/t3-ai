export default async function getUserLanguages(ctx: Context) {
    const userId = ctx.params.userId

    const languages = await ctx.service("candidateLanguages").findAll(
        { userId: userId },
    );

    ctx.body = languages
}