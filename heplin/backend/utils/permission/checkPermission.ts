import { isObject } from "../object";

export async function checkPermission(ctx: Context, payload: { resource: any, scopes: string[] }) {
    const { resource, scopes } = payload;

    if (!resource) throw new Error("resource is required")

    if (!isObject(resource)) throw new Error("resource must be an object");

    const resourceKeys = Object.keys(resource)

    const firstQuery: any = {}
    const lastQuery: any = {}

    for (let index = 0; index < resourceKeys.length; index++) {
        const key = resourceKeys[index];

        firstQuery["resource." + key] = "*"
        lastQuery["resource." + key] = resource[key]
    }

    const isExistPermission = await ctx.service("permissions").findOne({
        $or: [
            firstQuery,
            lastQuery
        ],
        userId: ctx.state.user?._id?.toString(),
        allowed: true,
        scope: {
            $in: Array.isArray(scopes) ? scopes : [scopes]
        },
    })

    if (!isExistPermission) throw new Error("You don't have permission to access this resource")

    return {
        hasAccess: true
    }
}
