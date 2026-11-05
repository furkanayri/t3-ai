export default async function deleteCV(ctx: Context) {
    const userId = ctx.state.user._id
    const { cvId } = ctx.params

    await ctx.service("cv").softDelete(cvId, userId);

    ctx.body = { message: "CV delete successfully" }
}