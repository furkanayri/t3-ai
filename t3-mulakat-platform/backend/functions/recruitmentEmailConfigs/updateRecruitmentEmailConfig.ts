export default async function updateRecruitmentEmailConfig(ctx: Context) {
    const { tenantId, configId } = ctx.params

    const payload = {
        ...ctx.request.body,
        tenantId,
    }

    const config = await ctx.service("recruitmentEmailConfigs")
        .updateOne({ _id: configId, tenantId }, payload)

    ctx.body = { config }
}