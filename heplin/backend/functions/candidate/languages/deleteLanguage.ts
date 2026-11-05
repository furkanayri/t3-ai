export default async function deleteLanguage(ctx: Context) {
    const userId = ctx.state.user._id;

    const language = await ctx
        .service("candidateLanguages")
        .softDelete(
            { _id: ctx.params.languageId, userId },
            ctx.state.user._id
        );

    ctx.body = {
        language,
    };
}
