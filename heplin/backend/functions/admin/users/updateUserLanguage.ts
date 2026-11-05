export default async function updateUserLanguage(ctx: Context) {
    const { userId, languageId } = ctx.params;
    const language = ctx.service("candidateLanguages").updateOne(
        {
            _id: languageId,
            userId,
        },
        ctx.request.body
    );
    ctx.body = { language };
}