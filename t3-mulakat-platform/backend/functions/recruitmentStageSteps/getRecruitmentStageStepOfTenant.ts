export default async function getRecruitmentStageStepOfTenant(ctx: Context) {
    const { tenantId, recruitmentStageId, stepId } = ctx.params;

    const query = {
        tenantId: tenantId,
        _id: stepId,
        recruitmentStageId,
        isDeleted: { $ne: true }
    };

    const recruitmentStageStep = await ctx.service('recruitmentStageSteps').findOne(query);

    ctx.body = { recruitmentStageStep };
}