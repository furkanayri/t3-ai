export default async function createUserLanguage(ctx: Context) {
  const { userId } = ctx.params;
  const language = await ctx
    .service("candidateLanguages")
    .create({ ...ctx.request.body, userId });
  ctx.body = { language };
}
