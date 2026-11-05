import { checkPermission } from "@/utils";


export default async function checkUserPermission(ctx: Context, options = {} as any) {
    try {
        const { scopes, resource } = options
        if (resource?.tenantId) {
            resource.tenantId = ctx.params.tenantId
        }

        const permissionInfo = await checkPermission(ctx, { resource, scopes });

        if (!permissionInfo?.hasAccess) {
            throw new Error('You do not have permission to access this resource');
        }
        ctx.state.hasAccess = true
    } catch (error) {
        ctx.status = 403; // Set HTTP status to 403 Unauthorized
        ctx.body = {
            message: error?.message
        }
        return ctx.stop()
    }
};