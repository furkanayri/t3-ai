import { array } from "@/utils";

export default async function action(ctx: Context) {
    const tenant = ctx.state.tenant;
    const { action, mailIds } = ctx.request.body

    if (!tenant?.senderMailAddress) {
        ctx.throw(
            400,
            "Mailbox configuration does not found. Please configure your mailbox."
        );
    }


    const mailIdsArr = array<any>(mailIds)

    if (["markAsRead", "markAsUnread", "delete", "archive", "unarchive"].includes(action) === false) {
        return ctx.throw(400, "Invalid action")
    }

    if (mailIdsArr.length === 0 || mailIdsArr.some(id => typeof id !== "string")) {
        return ctx.throw(400, "Invalid mail ids")
    }

    if (!tenant?.senderMailAddress) {
        ctx.throw(
            400,
            "Mailbox configuration does not found. Please configure your mailbox."
        );
    }

    const query: any = {
        _id: { $in: mailIdsArr },
        $or: [
            { "from.address": tenant?.senderMailAddress },
            { "to.address": tenant?.senderMailAddress },
        ]

    };

    const payload: any = {}

    if (action === "markAsRead") {
        payload.isSeen = true
    }
    if (action === "markAsUnread") {
        payload.isSeen = false
    }

    if (action === "delete") {
        payload.isDeleted = true
    }

    if (action === "archive") {
        payload.isArchived = true
        console.log("payload", payload)
    }

    if (action === "unarchive") {
        payload.isArchived = false
    }

    await ctx.service("mails").updateMany(query, payload)

    ctx.body = {
        isSuccess: true
    }

}