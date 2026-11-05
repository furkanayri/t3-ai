export default async function updateRecruitmentStageStep(ctx: Context) {
    const { tenantId, recruitmentStageId, stepId } = ctx.params;
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }
    const recruitmentStageStep = await ctx.service('recruitmentStageSteps').updateOne({
        _id: stepId,
        recruitmentStageId,
        tenantId,
    }, payload)
    ctx.body = { recruitmentStageStep };
}