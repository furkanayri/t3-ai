import { IPostingChannelType } from "@/types/entities";

export const applicationTypes: IPostingChannelType[] = ["careerpage", "jobportalpage"]

export default async function createPostingChannel(ctx: Context) {
    const tenantId = ctx.params.tenantId
    const payload = ctx.request.body

    let postingChannel = undefined

    const parentTenant = await ctx.service('tenants').findById(tenantId)
    if (parentTenant.parentTenantId) ctx.throw(401, "You are not allowed to create posting channels")

    const type = payload?.type
    if (!applicationTypes.includes(type)) ctx.throw(401, "Invalid posting channel type")

    if (payload?.tenantId?.toString() === parentTenant?._id?.toString()) {
        const existingCareerPagePostingChannel = await ctx.service("postingChannels").findOne({
            tenantId: parentTenant?._id,
            type
        })

        if (!!existingCareerPagePostingChannel)
            ctx.throw(401, "Tenant already has a career page posting channel")
        else {
            const createdPostingChannel = await ctx.service("postingChannels").create(payload)
            postingChannel = createdPostingChannel
        }
    }
    else {
        const subTenant = await ctx.service('tenants').findById(payload.tenantId)
        if (subTenant.parentTenantId !== parentTenant?._id) ctx.throw(401, "Invalid tenant id")

        const existingCareerPagePostingChannel = await ctx.service("postingChannels").findOne({
            tenantId: subTenant?._id,
            type
        })

        delete payload.connectionChannelId

        if (!!existingCareerPagePostingChannel)
            ctx.throw(401, "Tenant already has a career page posting channel")
        else {
            const createdPostingChannel = await ctx.service("postingChannels").create(payload)
            postingChannel = createdPostingChannel
        }
    }


    ctx.body = { postingChannel }
}