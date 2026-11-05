export default async function getOneLanguage(ctx: Context) {
    const userId = ctx.state.user._id;

    const language = await ctx.service("candidateLanguages").findOne({
        _id: ctx.params.languageId,
        candidateId: userId
    })

    ctx.body = { language };
}
