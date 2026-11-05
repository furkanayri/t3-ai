export default async function getOneEducation(ctx: Context) {
    const userId = ctx.state.user?._id;

    const education = await ctx.service("candidateEducations").findOne({
        _id: ctx.params.educationId,
        userId
    })

    ctx.body = { education };
}
