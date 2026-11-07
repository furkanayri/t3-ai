export default async function markAsRead(ctx: Context) {
    const { user } = ctx.state;
    const query = {
        isDeleted: { $ne: true },
        isRead: false,
        UserId: user?._id,
    };

    const options = {
        sort: { createdAt: -1 },
        limit: 8
    };

    try {
        const notifications = await ctx.service('notifications').findAll(query);
        for (const notification of notifications.results) {
            notification.isRead = true;
            await notification.save();
        }

        ctx.body = notifications;
    } catch (error) {
        ctx.throw(500, 'Bir hata oluştu');
    }
}
