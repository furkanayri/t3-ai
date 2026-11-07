export default async function updateRecruitmentStage(ctx: Context) {
    const { tenantId, recruitmentStageId } = ctx.params;
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }
    const recruitmentStage = await ctx.service('recruitmentStages').updateOne({
        _id: recruitmentStageId,
        tenantId,
    }, payload)
    ctx.body = { recruitmentStage };
}