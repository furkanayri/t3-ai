export default async function getOneSkill(ctx: Context) {
    const userId = ctx.state.user._id;

    const skill = await ctx.service("candidateSkills").findOne({
        _id: ctx.params.skillId
    })

    ctx.body = { skill };
}
