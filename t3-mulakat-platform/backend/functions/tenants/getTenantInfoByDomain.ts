export default async function getTenantInfoByDomain(ctx: Context) {
    const domain = ctx.params.domain;
    ctx.body = await getTenantInfoByDomainFnc(ctx, { domain });
}

export async function getTenantInfoByDomainFnc(ctx: Context, payload: { domain: string }) {
    const { domain } = payload;
    console.log("domain", domain);

    const tenant = await ctx.service('tenants').findOne({
        $or: [
            {
                subdomain: domain?.toString(),
            },
            {
                customDomain: domain?.toString(),
            },
        ]
    }, {
        select: "-isActive -isDeleted -createdAt -updatedAt -__v -address"
    })

    const mainChannels = await ctx.service('postingChannels').findAll({
        tenantId: tenant?._id,
    })

    const connectedChannels = await ctx.service('postingChannels').findAll({
        connectionChannelId: { $in: mainChannels?.results?.map(item => item._id) }
    })

    return {
        tenant: tenant,
        channels: {
            mainChannels,
            connectedChannels
        }
    };
}
