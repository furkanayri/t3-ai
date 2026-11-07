export default async function deleteCandidateEvaluation(ctx: Context) {
    const { tenantId, candidateEvaluationId, candidateId } = ctx.params;
    const { user } = ctx.state;

    await ctx.service('candidateEvaluations').softDelete({
        tenantId,
        _id: candidateEvaluationId,
        candidateId
    }, user?._id);

    ctx.body = { isSuccess: true };
}