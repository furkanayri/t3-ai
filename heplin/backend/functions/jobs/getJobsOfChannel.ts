export default async function getJobsOfChannel(ctx: Context) {
    const { channelId } = ctx.params;

    const channel = await ctx.service("postingChannels").findOne({
        _id: channelId
    });
    if (!channel || channel.status !== "active") {
        return ctx.throw(404, "Channel not found or not active");
    }

    const tenant = await ctx.service("tenants").findOne({
        _id: channel.tenantId
    });

    if (!tenant || tenant.status !== "active") {
        return ctx.throw(404, "Tenant not found or not active");
    }

    if (channel.type === "connection") {
        return ctx.throw(400, "Connection channel cannot be used to get jobs")
    }
    if (channel.type === "jobportalpage") {
        const connectedChannels = await ctx.service("postingChannels").findAll({
            connectionChannelId: channel._id,
            status: "active"
        });

        const jobs = await ctx.service("jobs").findAll({
            $or: [
                {
                    tenantId: tenant?._id,
                    'publishedChannels.channelId': channel?._id,
                    'publishedChannels.status': "published",
                    status: "active"
                },
                {
                    'publishedChannels.channelId': { $in: connectedChannels?.results?.map(c => c._id) },
                    'publishedChannels.status': "published",
                    status: "active"
                }
            ]
        });

        ctx.body = jobs
        return
    }

    if (channel.type === "careerpage") {
        const jobs = await ctx.service("jobs").findAll({
            tenantId: tenant?._id,
            'publishedChannels.channelId': channel?._id,
            'publishedChannels.status': "published",
            status: "active"
        });

        ctx.body = jobs
        return
    }

    if (channel.type === "indeed" || channel.type === "kariyernet" || channel.type === "linkedin") {
        return ctx.throw(501, "Channel type not implemented");
    }
}

