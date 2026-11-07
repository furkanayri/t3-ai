export default async function updateComment(ctx: Context) {
    const { candidateId, tenantId, commentId } = ctx.params

    const { content } = ctx.request.body

    const payload = {
        content,
    }

    await ctx.service("candidateComments").updateOne({ _id: commentId, candidateId, tenantId }, payload)

    ctx.body = {
        isSuccess: true
    }
}