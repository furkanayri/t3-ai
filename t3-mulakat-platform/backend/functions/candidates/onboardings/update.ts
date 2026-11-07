export default async function updateCandidateEvaluation(ctx: Context) {
    const { tenantId, onboardingId, candidateId } = ctx.params;
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }
    const candidateOnboarding = await ctx.service('candidateOnboardings').updateOne({
        _id: onboardingId,
        tenantId,
        candidateId
    }, payload)
    ctx.body = { candidateOnboarding };
}