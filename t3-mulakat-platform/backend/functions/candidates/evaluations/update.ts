export default async function updateCandidateEvaluation(ctx: Context) {
    const { tenantId, candidateEvaluationId, candidateId } = ctx.params;
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }
    const candidateEvaluation = await ctx.service('candidateEvaluations').updateOne({
        _id: candidateEvaluationId,
        tenantId,
        candidateId
    }, payload)
    ctx.body = { candidateEvaluation };
}