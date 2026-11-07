export default async function deleteRecruitmentStageStep(ctx: Context) {
    const { tenantId, recruitmentStageId, stepId } = ctx.params;
    const { user } = ctx.state;

    const recruitmentStageStep = await ctx.service('recruitmentStageSteps').softDelete({
        tenantId,
        _id: stepId,
        recruitmentStageId,
    }, user?._id);

    //Delete email config that is related to the step
    const emailConfig = await ctx.service('recruitmentEmailConfigs').findOne({
        tenantId,
        recruitmentStageStepId: stepId,
        recruitmentStageId,
    })
    if (!!emailConfig) {
        const res = await ctx.service('recruitmentEmailConfigs').softDelete({
            tenantId,
            _id: emailConfig?._id,
        }, user?._id);
    }

    ctx.body = { isSuccess: recruitmentStageStep, _id: stepId };
}