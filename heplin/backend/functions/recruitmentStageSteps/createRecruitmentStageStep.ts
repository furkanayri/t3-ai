export default async function createRecruitmentStageStep(ctx: Context) {
    const { tenantId, recruitmentStageId } = ctx.params;

    const payload = { ...ctx.request.body, recruitmentStageId, tenantId }
    const recruitmentStageStep = await ctx.service('recruitmentStageSteps').create(payload);

    //Create default email config once step is created
    //FIXME: replace content with template email Id once the model is integrated
    const emailPayload = {
        isEmailsActive: false,
        recruitmentStageId,
        recruitmentStageStepId: recruitmentStageStep?._id,
        tenantId
    }
    const emailConfig = await ctx.service('recruitmentEmailConfigs')
        .create(emailPayload)


    ctx.body = {
        recruitmentStageStep,
        emailConfig
    };
}