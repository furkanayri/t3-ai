
export default async function createEvaluationTemplate(ctx: Context) {
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }
    const evaluationTemplate = await ctx.service('evaluationTemplates').create(payload);
    ctx.body = { evaluationTemplate };
}