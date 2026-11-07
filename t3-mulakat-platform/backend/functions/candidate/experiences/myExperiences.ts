export default async function myExperiences(ctx: Context) {
    const userId = ctx.state.user._id;

    const experiences = await ctx.service("candidateExperiences").findAll({
        userId
    });

    ctx.body = experiences;
}
