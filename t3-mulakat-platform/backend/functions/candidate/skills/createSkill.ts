export default async function createSkill(ctx: Context) {
    const userId = ctx.state.user._id;

    ctx.request.body.userId = userId;
    const skill = await ctx.service("candidateSkills").create(ctx.request.body);

    ctx.body = {
        skill
    };
}