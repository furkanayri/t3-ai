export default async function getAllJobsOfTenant(ctx: Context) {
    const { tenantId } = ctx.params;
    const { page, limit, status } = ctx.query;

    let query = {}
    if (status === "closed") {
        query = {
            tenantId: tenantId,
            isDeleted: { $ne: true },
            $or: [
                { 'publishedChannels.status': ["closed", "declined", "pendingClosure"] },
            ]
        };
    }
    else if (status === "pending") {
        query = {
            tenantId: tenantId,
            isDeleted: { $ne: true },
            $or: [
                { 'publishedChannels.status': ["pending", "draft"] },
                { 'publishedChannels': { $exists: true, $size: 0 } },
            ]
        };
    }
    else {
        query = {
            tenantId: tenantId,
            isDeleted: { $ne: true },
            'publishedChannels.status': status
        }
    }


    const pagination = {
        page: page || 1,
        limit: limit || Infinity,
        sort: "-createdAt",

    };

    const jobs = await ctx.service('jobs').findAll({
        ...query,
        ...pagination
    }, {
        populate: [
            {
                path: 'skills',
                select: '_id name slug'
            }
        ]
    });
    ctx.body = jobs
}