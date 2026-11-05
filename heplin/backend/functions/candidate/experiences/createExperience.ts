export default async function createExperience(ctx: Context) {
    const userId = ctx.state.user._id;

    ctx.request.body.userId = userId;
    const experience = await ctx.service("candidateExperiences").create(ctx.request.body);

    ctx.body = {
        experience
    };
}