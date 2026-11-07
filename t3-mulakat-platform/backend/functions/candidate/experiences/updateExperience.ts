export default async function updateExperience(ctx: Context) {
    const userId = ctx.state.user._id;

    const experience = await ctx.service("candidateExperiences").updateOne({
        _id: ctx.params.experienceId,
        userId
    }, ctx.request.body)

    ctx.body = { experience };
}