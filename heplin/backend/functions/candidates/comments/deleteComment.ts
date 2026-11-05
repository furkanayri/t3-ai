export default async function deleteComment(ctx: Context) {
    const { candidateId, tenantId, commentId } = ctx.params;

    const userId = ctx.state.user._id;

    await ctx
        .service("candidateComments")
        .softDelete({ _id: commentId, candidateId, tenantId }, userId);

    ctx.body = {
        isSuccess: true,
    };
}
