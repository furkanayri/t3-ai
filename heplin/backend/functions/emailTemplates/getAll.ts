export default async function getAll(ctx: Context) {
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

    const res = await ctx.service('emailTemplates').findAll({
        ...query, ...pagination
    });
    ctx.body = res
}