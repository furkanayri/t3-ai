export default async function getAllCategory(ctx: Context) {
    const { page, limit, status } = ctx.query;

    const query = {
        isDeleted: { $ne: true },
        status
    };

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };
    const categories = await ctx.service('categories').findAll({
        ...query,
        ...pagination
    }, {
        populate: [
            {
                path: 'tenantId',
                select: '_id name'
            }
        ]
    });
    ctx.body = categories
}