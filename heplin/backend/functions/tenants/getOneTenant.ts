export default async function getOneTenant(ctx: Context) {
    const response = await ctx.service("tenants").findById(ctx.params.tenantId);

    ctx.body = {
        tenant: response,
    };
}