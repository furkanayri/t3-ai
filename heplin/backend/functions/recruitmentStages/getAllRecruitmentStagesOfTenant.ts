export default async function getAllDepartmentsOfTenant(ctx: Context) {
    const { tenantId } = ctx.params;
    const { page, limit } = ctx.query;
    const query = {
        tenantId: tenantId,
        isDeleted: { $ne: true }
    };
    const pagination = {
        page: page || 1,
        limit: limit || 1000,
        sort: "-createdAt",
    };
    const recruitmentStages = await ctx.service('recruitmentStages').findAll({
        ...query,
        ...pagination
    });
    ctx.body = recruitmentStages
}