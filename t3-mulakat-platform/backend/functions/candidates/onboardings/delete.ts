export default async function deleteCandidateEvaluation(ctx: Context) {
    const { tenantId, onboardingId, candidateId } = ctx.params;
    const { user } = ctx.state;

    await ctx.service('candidateOnboardings').softDelete({
        tenantId,
        _id: onboardingId,
        candidateId
    }, user?._id);

    ctx.body = { isSuccess: true };
}