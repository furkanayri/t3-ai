export default async function getOneExperience(ctx: Context) {
    const userId = ctx.state.user._id;

    const experience = await ctx.service("candidateExperiences").findOne({
        _id: ctx.params.experienceId,
        candidateId: userId
    })

    ctx.body = { experience };
}
