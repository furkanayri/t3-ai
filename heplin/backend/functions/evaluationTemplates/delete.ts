export default async function deleteEvaluationOfTenant(ctx: Context) {
    const { tenantId, evaluationTemplateId } = ctx.params;
    const { user } = ctx.state;

    await ctx.service('evaluationTemplates').softDelete({
        tenantId,
        _id: evaluationTemplateId,
    }, user?._id);

    ctx.body = { isSuccess: true };
}