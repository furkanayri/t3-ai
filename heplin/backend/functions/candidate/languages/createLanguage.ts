export default async function createLanguage(ctx: Context) {
    const userId = ctx.state.user._id;

    ctx.request.body.userId = userId;
    const language = await ctx.service("candidateLanguages").create(ctx.request.body);
   

    ctx.body = {
        language
    };
}