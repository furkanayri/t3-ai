import { ICandidate } from "@/types/entities";

export default async function getMyOnboardingDetail(ctx: Context) {
    const { onboardingId } = ctx.params;
    const userId = ctx.state.user._id;
    const candidateOnboarding = await ctx.service('candidateOnboardings').findOne({ _id: onboardingId }, {
        populate: [
            { path: "candidateId", select: "name surname email" },
            { path: "employeeId", select: "name surname email" },
            { path: "jobId" },
            { path: "jobApplicationId" },
            { path: "onboardingWorkflowId" },
        ],
    });

    if (!candidateOnboarding) ctx.throw(404, 'Onboarding not found');
    //TODO: check if the candidate's userId is the same as the user
    // if ((candidateOnboarding.candidateId as ICandidate)?.userId.toString() !== userId) ctx.throw(403, 'Unauthorized');

    ctx.body = { candidateOnboarding };
}