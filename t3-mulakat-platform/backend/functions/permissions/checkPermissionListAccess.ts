import { PERMISSION_SCOPES } from "@/constants";

export default async function checkPermissionListAccess(ctx: Context) {
    const hasListPermission = await ctx.service('permissions').findOne({
        userId: ctx.state?.user?._id,
        allowed: true,
        scope: PERMISSION_SCOPES.list_permissions

    })

    if (!hasListPermission) ctx.throw(401, "You are not allowed to list permissions!")
}