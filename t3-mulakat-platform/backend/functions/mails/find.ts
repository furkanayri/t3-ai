export default async function get(ctx: Context) {
    const { id } = ctx.params;
    const tenant = ctx.state.tenant;

    const mail = await ctx.service('mails').findOne({
        _id: id,
        $or: [
            { "from.address": tenant?.senderMailAddress },
            { "to.address": tenant?.senderMailAddress },
            { "cc.address": tenant?.senderMailAddress },
        ]
    });

    if (!mail) {
        return ctx.throw(404, 'Mail not found');
    }

    const threadId = mail.threadId;
    const mails = await ctx.service('mails').findAll({
        threadId: threadId,
        $or: [
            { "from.address": tenant?.senderMailAddress },
            { "to.address": tenant?.senderMailAddress },
            { "cc.address": tenant?.senderMailAddress },
        ]
    });

    await ctx.service('mails').updateMany(
        { threadId: threadId, isSeen: false },
        { isSeen: true }
    );

    ctx.body = { mails };
}
