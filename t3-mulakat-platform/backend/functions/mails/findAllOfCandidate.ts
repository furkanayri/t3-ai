
export default async function findAllOfCandidate(ctx: Context) {
    const tenant = ctx.state.tenant;
    const { tenantId } = ctx.params;

    const { status, page, folder, candidateId } = ctx.query;

    const senderMailAddress = tenant?.senderMailAddress;
    console.log("aaaaa")
    if (!senderMailAddress) {
        ctx.throw(400, "Mailbox configuration does not found. Please configure your mailbox.");
    }

    const candidate = await ctx.service("candidates").findOne({
        _id: candidateId,
        tenantId,
    },
        {
            populate: [{
                path: "userId",
                select: "_id name surname email"
            }]
        });

    if (!candidate) {
        return ctx.throw(404, "Candidate not found");
    }

    const user: any = candidate.userId;
    if (!user) {
        return ctx.throw(404, "User not found");
    }

    const userEmail = user.email;

    if (!userEmail) {
        return ctx.throw(404, "User email not found");
    }

    const query: any = {
        isArchived: false,
        $or: [
            {
                "from.address": senderMailAddress,
                $or: [
                    { "to.address": userEmail },
                    { "cc.address": userEmail }
                ]
            },
            {
                "from.address": userEmail,
                $or: [
                    { "to.address": senderMailAddress },
                    { "cc.address": senderMailAddress }
                ]
            }
        ]
    };

    if (status === "unread") {
        query.isSeen = { $ne: true };
    }

    if (folder === "archived") {
        query.isArchived = true;
    }

    const mails = await ctx.service("mails").findAll({
        ...query, page, limit: Infinity, sort: "-date"
    });

    const allMailsCount = await ctx
        .service("mails")
        .count({ ...query, isSeen: { $in: [true, false, null, undefined] } });
    const unreadMailsCount = await ctx
        .service("mails")
        .count({ ...query, isSeen: { $ne: true } });

    ctx.body = {
        ...mails,
        senderMailAddress: tenant?.senderMailAddress,
        unreadMailsCount,
        allMailsCount,
    };
}
