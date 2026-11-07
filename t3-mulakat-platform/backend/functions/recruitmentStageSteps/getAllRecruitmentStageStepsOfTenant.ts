export default async function getAllRecruitmentStageStepsOfTenant(ctx: Context) {
    const { tenantId, recruitmentStageId } = ctx.params;
    const { page, limit } = ctx.query;
    const query = {
        tenantId: tenantId,
        isDeleted: { $ne: true },
        recruitmentStageId
    };
    const options = {
        page: page || 1,
        limit: limit || 1000,
        sort: { createdAt: -1 },
    };
    const recruitmentStageSteps = await ctx.service('recruitmentStageSteps').findAll(query);
    ctx.body = recruitmentStageSteps
}