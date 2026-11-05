import sendEmail from "@/utils/mail/sendMail";

export default async function updateMyOnboarding(ctx: Context) {
    const { onboardingId } = ctx.params;
    const { offeragain } = ctx.query
    const {
        tenantId,
        jobId,
        candidateId,
        responses
    } = ctx.request.body



    const candidateOnboarding = await ctx.service('candidateOnboardings').findOne({ _id: onboardingId });
    if (!candidateOnboarding) ctx.throw(404, 'Onboarding not found');

    if (offeragain) {
        const tenant = await ctx.service("tenants").findOne({
            _id: tenantId,
        });
        const candidate = await ctx.service("candidates").findOne({
            _id: candidateId,
        });
        const job = await ctx.service('jobs').findOne({
            _id: jobId
        })

        await sendEmail(tenant.senderMailAddress, candidate.email, 'Onboarding Teklifi - Güncellenmiş', 're-onboarding', {
            jobTitle: job.title,
            name:candidate.name
        })

    }
    console.log(responses);
    
    if (responses) {
        const allResponsesCompleted = responses.every((response: any) => response.response);
        const someResponsesIncomplete = responses.some((response: any) => !response.response);
        if (allResponsesCompleted) {
            ctx.request.body.status = 'completed';
        }
        if(someResponsesIncomplete){
            ctx.request.body.status = 'documentsMissing';
        }
    }

    const updatedOnboarding = await ctx.service('candidateOnboardings').update(onboardingId, { ...ctx.request.body });
    ctx.body = { candidateOnboarding: updatedOnboarding };
}