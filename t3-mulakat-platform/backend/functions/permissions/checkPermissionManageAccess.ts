import { PERMISSION_SCOPES } from "@/constants";

export default async function checkPermissionManageAccess(ctx: Context) {
    const hasManagePermission = await ctx.service('permissions').findOne({
        userId: ctx.state?.user?._id,
        allowed: true,
        scope: PERMISSION_SCOPES.manage_permissions
    })

    if (!hasManagePermission) ctx.throw(401, "You are not allowed to manage permissions!")
}