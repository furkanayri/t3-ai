export default async function getOneCandidateOnboarding(ctx: Context) {
    const { tenantId, onboardingId } = ctx.params;

    const query = {
        tenantId: tenantId,
        _id: onboardingId,
    };

    const candidateOnboarding = await ctx.service('candidateOnboardings').findOne(query, {
        populate: [
            { path: "candidateId", select: "name surname email" },
            { path: "employeeId", select: "name surname email" },
            { path: "jobId"},
            { path: "jobApplicationId" ,populate: { path: "onboardingId" }},
            { path: "onboardingWorkflowId" },
        ],
    });

    ctx.body = { candidateOnboarding };
}