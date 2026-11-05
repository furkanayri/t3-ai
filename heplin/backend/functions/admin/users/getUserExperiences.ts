export default async function getUserExperiences(ctx: Context) {
    const userId = ctx.params.userId

    const experiences = await ctx.service("candidateExperiences").findAll(
        { userId: userId },
    );

    ctx.body = experiences
}