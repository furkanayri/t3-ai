export default async function getUserSkills(ctx: Context) {
    const userId = ctx.params.userId

    const skills = await ctx.service("candidateSkills").findAll(
        { userId: userId },
        { populate: ["skills"] }
    );

    ctx.body = skills
}