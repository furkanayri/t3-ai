export default async function deleteEducation(ctx: Context) {
    const userId = ctx.state.user._id;

    const education = await ctx.service("candidateEducations").softDelete({
        _id: ctx.params.educationId,
        userId
    }, userId);
    ctx.body = {
        education
    };
}