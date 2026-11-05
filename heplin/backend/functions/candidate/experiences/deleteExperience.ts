export default async function deleteExperience(ctx: Context) {
    const userId = ctx.state.user._id;

    const experience = await ctx
        .service("candidateExperiences")
        .softDelete(
            { _id: ctx.params.experienceId, userId },
            ctx.state.user._id
        );

    ctx.body = {
        experience,
    };
}
