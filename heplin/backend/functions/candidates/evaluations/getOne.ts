export default async function getCandidateEvaluation(ctx: Context) {
    const { tenantId, candidateEvaluationId, candidateId } = ctx.params;

    const query = {
        tenantId: tenantId,
        _id: candidateEvaluationId,
        isDeleted: { $ne: true },
        candidateId
    };

    const candidateEvaluation = await ctx.service('candidateEvaluations').findOne(query);

    ctx.body = { candidateEvaluation };
}