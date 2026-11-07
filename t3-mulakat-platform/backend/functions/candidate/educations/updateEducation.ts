export default async function updateEducation(ctx: Context) {
    const userId = ctx.state.user._id

    const education = await ctx.service("candidateEducations").updateOne({
        _id: ctx.params.educationId,
        userId
    }, ctx.request.body)

    ctx.body = { education };
}