export default async function deleteSkill(ctx: Context) {
    const userId = ctx.state.user._id;

    const skill = await ctx
        .service("candidateSkills")
        .softDelete(
            { _id: ctx.params.skillId, userId },
            ctx.state.user._id
        );

    ctx.body = {
        skill,
    };
}
