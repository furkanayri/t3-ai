import { getTenantInfoByDomainFnc } from "../tenants/getTenantInfoByDomain";

export default async function jobsByDomain(ctx: Context) {
    const { domain } = ctx.params;
    const { channelType, jobType, locationType, title, city, page, limit } = ctx.query;
    const pagination = {
        page: page || undefined,
        limit: limit || undefined,
        sort: "-createdAt",
    };

    if (!domain) {
        return ctx.throw(400, "Domain is required");
    }

    const tenantRes = await getTenantInfoByDomainFnc(ctx, { domain });

    const tenant = tenantRes?.tenant;

    if (!tenant || tenant.status !== "active") {
        return ctx.throw(404, "Tenant not found or not active");
    }

    if (channelType === "connection") {
        return ctx.throw(400, "Connection channel cannot be used to get jobs")
    }


    if (["indeed", "kariyernet", "linkedin"].includes(channelType?.toString())) {
        return ctx.throw(501, "Channel type not implemented");
    }

    let query: any = {}

    if (channelType === 'districtgovernorate') {
        console.log(channelType, `channelType`,);
        const mainChannels = await ctx.service('postingChannels').findAll({
            type: 'districtgovernorate'
        })
        const channel = mainChannels?.results
            ?.find(item => item?.type === 'districtgovernorate')
        if (!channel || channel.status !== "active") {
            return ctx.throw(404, "Channel not found or not active");
        }
        query = {
            publishedChannels: {
                $elemMatch: {
                    channelId: channel?._id,
                    status: "published"
                }
            },
            status: "active"
        }

    }

    if (channelType === 'careerpage') {
        const channel = tenantRes.channels?.mainChannels?.results
            ?.find(item => item?.type === 'careerpage')
        if (!channel || channel.status !== "active") {
            return ctx.throw(404, "Channel not found or not active");
        }

        query = {
            tenantId: tenant?._id,
            publishedChannels: {
                $elemMatch: {
                    channelId: channel?._id,
                    status: "published"
                }
            },
            status: "active"
        }
    }

    if (channelType === 'jobportalpage' || !channelType) {
        const channel = tenantRes.channels?.mainChannels?.results
            ?.find(item => item?.type === 'jobportalpage')
        if (!channel) {
            return ctx.throw(404, "Job portal page channel not found");
        }

        const connectedChannels = tenantRes.channels?.connectedChannels?.results
            ?.filter(item => item?.connectionChannelId?.toString() === channel?._id?.toString())

        query = {
            $or: [
                {
                    tenantId: tenant?._id,
                    publishedChannels: {
                        $elemMatch: {
                            channelId: channel?._id,
                            status: "published"
                        },
                    },
                    status: "active"
                },
                {
                    publishedChannels: {
                        $elemMatch: {
                            channelId: { $in: connectedChannels?.map(c => c._id) },
                            status: "published"
                        },
                    },
                    status: "active"
                }
            ]
        }
    }

    if (jobType) {
        query.jobType = jobType;
    }
    if (locationType) {
        query.locationType = locationType;
    }
    if (title) {
        query.title = { $regex: title, $options: "i" };
    }
    if (city) {
        query.city = { $regex: city, $options: "i" };
    }

    const jobs = await ctx.service("jobs").findAll({
        ...query, ...pagination
    }, {

        populate: {
            path: 'tenantId',
            select: 'name _id subdomain logo'
        }
    }
    );

    ctx.body = jobs
}