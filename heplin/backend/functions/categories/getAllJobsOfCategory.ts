export default async function getAllJobsOfCategory(ctx: Context) {
    const { categoryId } = ctx.params;
    const { page, limit } = ctx.query;

    const query = {
        isDeleted: { $ne: true },
        categoryId
    };

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const jobs = await ctx.service('jobs').findAll({
        ...query,
        ...pagination,
    }, {
        populate: [
            {
                path: 'tenantId',
                select: '_id name phone address'
            },
            {
                path: 'categoryId',
                select: '_id name'
            }
        ]
    });

    ctx.body = jobs;
}