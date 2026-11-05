export default async function getOne(ctx: Context) {
    const { tenantId } = ctx.params;
    const { page, limit } = ctx.query;

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const query = {
        tenantId: tenantId,
        isDeleted: { $ne: true }
    };


    const res = await ctx.service('disqualifyEmailTemplates').findAll({
        ...query,
        ...pagination,
    });
    ctx.body = res
}