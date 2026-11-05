export default async function deleteOneTenant(ctx: Context) {
    const id = ctx.params.tenantId;

    const response = await ctx.service("tenants").softDelete(id, ctx.state.user._id);

    ctx.body = {
        isSuccess: response,
    };
}