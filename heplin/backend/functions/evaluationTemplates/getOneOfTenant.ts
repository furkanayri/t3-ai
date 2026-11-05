export default async function getEvaluationTemplateOfTenant(ctx: Context) {
    const { tenantId, evaluationTemplateId } = ctx.params;

    const query = {
        tenantId: tenantId,
        _id: evaluationTemplateId,
        isDeleted: { $ne: true }
    };

    const evaluationTemplate = await ctx.service('evaluationTemplates').findOne(query);

    ctx.body = { evaluationTemplate };
}