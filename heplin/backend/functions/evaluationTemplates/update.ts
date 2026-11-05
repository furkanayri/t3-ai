export default async function updateEvaluationTemplate(ctx: Context) {
    const { tenantId, evaluationTemplateId } = ctx.params;
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }
    const evaluationTemplate = await ctx.service('evaluationTemplates').updateOne({
        _id: evaluationTemplateId,
        tenantId,
    }, payload)
    ctx.body = { evaluationTemplate };
}