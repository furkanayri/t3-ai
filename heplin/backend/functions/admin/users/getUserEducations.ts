export default async function getUserEducations(ctx: Context) {
    const userId = ctx.params.userId

    const educations = await ctx.service("candidateEducations").findAll(
        { userId: userId },
    );

    ctx.body = educations
}