export default async function updateLanguage(ctx: Context) {
    const userId = ctx.state.user._id;

    const language = await ctx.service("candidateLanguages").updateOne({
        _id: ctx.params.languageId,
        userId
    }, ctx.request.body)

    ctx.body = { language };
}