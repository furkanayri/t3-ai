export default async function getAllDepartmentsOfTenant(ctx: Context) {
    const { tenantId } = ctx.params;
    const { page, limit } = ctx.query;
    const query = {
        tenantId: tenantId,
        isDeleted: { $ne: true }
    };
    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };
    const departments = await ctx.service('departments').findAll({
        ...query,
        ...pagination
    });
    ctx.body = departments
}