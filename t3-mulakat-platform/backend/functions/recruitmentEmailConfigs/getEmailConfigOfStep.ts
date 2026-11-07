export default async function getEmailConfigOfStep(ctx: Context) {
    const { tenantId, stepId: recruitmentStageStepId } = ctx.params

    const config = await ctx.service("recruitmentEmailConfigs")
        .findOne({ tenantId, recruitmentStageStepId })

    ctx.body = { config }
}