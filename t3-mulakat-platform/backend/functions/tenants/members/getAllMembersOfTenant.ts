export default async function getAllMembersOfTenant(ctx: Context) {
    const { tenantId } = ctx.params
    const { populateUser, page, limit, status } = ctx.query


    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const query: any = { tenantId, }

    if (status) query.status = status

    const response = await ctx.service("tenantMembers").findAll({
        ...query, ...pagination
    }, {
        populate: populateUser ? {
            path: "userId",
            select: [
                "_id",
                "name",
                "surname",
                "email",
                "phone",
                "status",
                "avatar",
                "registrationToken",
                "registrationTokenExpires"
            ],
        } : undefined
    })

    ctx.body = response
}