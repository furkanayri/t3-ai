export default async function getAllCandidateEvaluationsOfTenant(ctx: Context) {
    const { tenantId, candidateId } = ctx.params;
    const { page, limit } = ctx.query;

    const query = {
        tenantId: tenantId,
        candidateId,
        isDeleted: { $ne: true },
    };

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const candidateEvaluations = await ctx.service('candidateEvaluations').findAll({ ...query, ...pagination },{
        populate: {
            path: 'evaluationTemplateId',
            select: 'scoreCards fields title',
        }
    })
    ctx.body = candidateEvaluations
}