export default async function updateSkill(ctx: Context) {
    const userId = ctx.state.user._id;

    const skill = await ctx.service("candidateSkills").updateOne({
        _id: ctx.params.skillId,
        userId
    }, ctx.request.body)

    ctx.body = { skill };
}