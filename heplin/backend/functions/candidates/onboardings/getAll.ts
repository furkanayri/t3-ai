export default async function getAllCandidateOnboardingsOfTenant(ctx: Context) {
    const { tenantId } = ctx.params;
    const { page, limit } = ctx.query;

    const query = {
        tenantId: tenantId,
        isDeleted: { $ne: true },
    };

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const candidateOnboardings = await ctx.service('candidateOnboardings').findAll({ ...query, ...pagination });
    ctx.body = candidateOnboardings
}