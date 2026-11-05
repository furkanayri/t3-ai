export default async function create(ctx: Context) {
    const { tenantId } = ctx.params;
    const payload = {
        tenantId,
        ...ctx.request.body
    }
    const res = await ctx.service('emailTemplates').create(payload);
    ctx.body = {
        res
    }
}