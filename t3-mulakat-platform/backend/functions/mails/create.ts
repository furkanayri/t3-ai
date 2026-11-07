import { sendEmailPlain } from "@/utils/mail";
import { v4 as uuidv4 } from 'uuid';
import { spendEmailCredit } from "../quotas/utils";

export default async function create(ctx: Context) {
    const { to, subject, body, threadId } = ctx.request.body;

    if (!to) return ctx.throw(400, "To is required");

    const tenant = ctx.state.tenant;

    if (!tenant?.senderMailAddress) {
        ctx.throw(400, "Mailbox configuration does not found. Please configure your mailbox.");
    }

    const finalThreadId = threadId || uuidv4();

    try {
        await sendEmailPlain(tenant?.senderMailAddress, to, subject, body);

        const mailRecord = await ctx.service("mails").create({
            date: new Date(),
            from: {
                name: "",
                address: tenant?.senderMailAddress,
                text: tenant?.senderMailAddress,
            },
            to: [{
                name: "",
                address: to,
            }],
            cc: null,
            bcc: null,
            subject: subject,
            text: body,
            html: null,
            attachments: [],
            isDeleted: false,
            isSeen: true,
            isArchived: false,
            threadId: finalThreadId,
        });
        await spendEmailCredit(ctx, tenant._id, 1)
        ctx.body = {
            isSuccess: true,
            threadId: finalThreadId,
        };
    } catch (error) {
        console.error("Mail sending failed:", error);
        ctx.throw(500, "Mail sending failed");
    }
}
