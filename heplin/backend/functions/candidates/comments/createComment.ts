export default async function createComment(ctx: Context) {
    const { candidateId, tenantId } = ctx.params
    const userId = ctx.state.user._id

    const { content } = ctx.request.body

    const payload = {
        content,
        candidateId,
        tenantId,
        createdBy: userId,
    }
    const res = await ctx.service("candidateComments").create(payload)

    ctx.body = {
        comment: res
    }
}