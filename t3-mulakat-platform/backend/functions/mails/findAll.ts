export default async function findAll(ctx: Context) {
    const tenant = ctx.state.tenant;

    const { status, page, folder } = ctx.query

    if (!tenant?.senderMailAddress) {
        ctx.throw(
            400,
            "Mailbox configuration does not found. Please configure your mailbox."
        );
    }

    const query: any = {
        isArchived: false
    };

    if (folder === "sent") {
        query["from.address"] = tenant?.senderMailAddress
    }
    else if (folder === "inbox") {
        query["to.address"] = tenant?.senderMailAddress
    }
    else {
        query.$or = [
            { "from.address": tenant?.senderMailAddress },
            { "to.address": tenant?.senderMailAddress },
            { "cc.address": tenant?.senderMailAddress }
        ]
    }

    if (folder === "candidates" || folder === "non-candidates") {
        const candidatesOfTenantResults = await ctx.service("candidates").findAll({ tenantId: tenant?._id });
        const candidatesOfTenant = candidatesOfTenantResults.results.map(result => result.email)

        if (folder === "candidates") {
            query["from.address"] = {
                $in: candidatesOfTenant
            }
        } else {
            query["from.address"] = {
                $nin: candidatesOfTenant
            }
        }
    }

    if (status === "unread") {
        query.isSeen = { ne: true };
    }

    if (folder === "archived") {
        query.isArchived = true
    }

    const mails = await ctx.service("mails").findAll({
        ...query, page, limit: Infinity, sort: "-date"
    })

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
        allMailsCount
    };
}
