import { UserStatus } from "@/types/entities";
import { sendInvitationEmail } from "./utils/membersUtils";

export default async function resendCreateProfileEmail (ctx: Context) {
    const { email } = ctx.request.body;

    const user = await ctx.service("users").findOne({
        email,
    })

    if (!user) ctx.throw(400, "User not found")

    if (user.isDeleted) ctx.throw(400, "User is deleted")

    if ((["deleted", "frozen", "passive"] as UserStatus[]).includes(user.status)) {
        ctx.throw(400, "User is not active")
    }
    const { registrationToken, registrationTokenExpires } = await sendInvitationEmail({ email })

    user.registrationToken = registrationToken;
    user.registrationTokenExpires = registrationTokenExpires;

    await user.save();

    ctx.body = {
        isSuccess: true,
        isSendRegistrationMail: true,
        email,
        user: user.toObject(),
    }

    return
}