export default async function updateOneTenant(ctx: Context) {
    const tenantId = ctx.params.tenantId
    const payload = ctx.request.body

    const res = await ctx.service("tenants").updateOne(
        { _id: tenantId },
        payload,
    );

    ctx.body = { tenant: res }
}