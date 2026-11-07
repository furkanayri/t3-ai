import sendEmail from "@/utils/mail/sendMail"
import crypto from "crypto";
import { PERMISSION_GROUPS } from "@/constants";

export const sendInvitationEmail = async ({ email }: { email: string }) => {
    const registrationToken = crypto.randomBytes(32).toString("hex");
    if (process.env.NODE_ENV === "development") {
        console.log(
            JSON.stringify(
                {
                    email,
                    registrationToken,
                },
                null,
                2
            )
        );
    }
    const hashedRegistrationToken = crypto
        .createHash("sha256")
        .update(registrationToken)
        .digest("hex");
    const registrationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const registrationLink = `${process.env.WEB_APP_URL}/create-account?registrationToken=${registrationToken}&company-invite=${true}`;

    await sendEmail("mail@heplin.com", email, "Create Account", "invitation-account", {
        link: registrationLink,
    })

    return {
        registrationToken: hashedRegistrationToken,
        registrationTokenExpires,
    }
}

export async function countTenantMembers(ctx: Context, tenantId: string) {
    const count = await ctx.service('tenantMembers').count({
        tenantId,
        isDeleted: { $ne: true }
    })

    return count
}

export async function assignAllPermissionsToUser(ctx: Context, tenantId: string, userId: string, admin?: boolean) {
    const allPermissionScopes = [].concat(...Object.values(PERMISSION_GROUPS))

    await Promise.all(allPermissionScopes
        .filter(ps => admin || ps !== "access_admin_panel")
        .map(permissionScope => {
            return ctx.service('permissions').updateOne({
                userId,
                scope: permissionScope
            }, {
                $addToSet: {
                    "resource.tenantId": tenantId?.toString(),
                },
                allowed: true
            }, {
                upsert: true,
                new: true
            })
        }))
}