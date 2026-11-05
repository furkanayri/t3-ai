export default async function getComment(ctx: Context) {
    const { candidateId, tenantId, commentId } = ctx.params

    const comment = await ctx.service("candidateComments").findOne({ _id: commentId, candidateId, tenantId })

    ctx.body = {
        comment,
    }
}