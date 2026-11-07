
export default async function createCandidateEvaluations(ctx: Context) {
    const payload = { ...ctx.request.body, candidateId: ctx.params.candidateId, tenantId: ctx.params.tenantId }
    const candidateEvaluation = await ctx.service('candidateEvaluations').create(payload);
    ctx.body = { candidateEvaluation };
}