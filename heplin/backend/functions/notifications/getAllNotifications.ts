export default async function getAllNotifications(ctx: Context) {
    const { user } = ctx.state;
    const query = {
        isDeleted: { $ne: true },
        UserId: user?._id,
    };

    const options = {
        sort: { createdAt: -1 },
        limit: 8
    };

    const plans = await ctx.service('notifications').findAll(query);
    ctx.body = plans;
}
