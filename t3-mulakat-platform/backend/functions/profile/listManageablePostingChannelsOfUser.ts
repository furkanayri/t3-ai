export default async function listManageablePostingChannelsOfUser(ctx: Context) {
    const permission = await ctx.service("permissions").findOne({
        scope: "list_manageable_posting_channels",
        userId: ctx.state.user._id,
        allowed: true
    });

    if (!permission) return ctx.throw(403, "Not have any permission for this action!")

    const filter: any = {}

    const resourceTenantId = permission.resource?.tenantId;

    if (resourceTenantId !== "*" && Array.isArray(resourceTenantId)) {
        filter.tenantId = {
            $in: resourceTenantId
        }
    }

    const postingChannels = await ctx.service("postingChannels").findAll(filter);

    ctx.body = postingChannels;
}