export default async function updateTenantQuotas(ctx: Context) {
    const { tenantId } = ctx.params

    const findQuota = await ctx.service('quotas').findOne({ tenantId: tenantId })
    if (!findQuota) {
        const payload = {
            tenantId: tenantId,
            ...ctx.request.body
        }
        const createQuota = await ctx.service('quotas').create(payload)
        ctx.body = createQuota
    }
    const quota = await ctx.service('quotas').updateOne({ tenantId: tenantId }, ctx.request.body)

    ctx.body = quota
}