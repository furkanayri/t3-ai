export default async function deleteTemplate(ctx: Context) {
    const { tenantId } = ctx.params;
    const res = await ctx.service('disqualifyEmailTemplates').softDelete(ctx.params.id, tenantId);
    ctx.body = {
        isSuccessful: true
    }
}