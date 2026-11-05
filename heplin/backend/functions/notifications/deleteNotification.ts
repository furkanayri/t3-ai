export default async function deleteNotification(ctx: Context) {
    const { notificationId } = ctx.params;
    const notification = await ctx.service('notifications').delete(notificationId);
    console.log("notificationId", notificationId);
    ctx.body = { isSuccess: notification };
}  