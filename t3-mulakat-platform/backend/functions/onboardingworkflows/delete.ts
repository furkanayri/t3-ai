export default async function deleteworkflow(ctx: Context) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const result = await ctx.service('onboardingworkflows').softDelete({
        _id: id,
        tenantId: ctx.params.tenantId,
    }, user?._id);
    ctx.body = { result };
}