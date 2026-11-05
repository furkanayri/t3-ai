
export default async function createRecruitmentStage(ctx: Context) {
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }
    const recruitmentStages = await ctx.service('recruitmentStages').create(payload);
    ctx.body = { recruitmentStages };
}