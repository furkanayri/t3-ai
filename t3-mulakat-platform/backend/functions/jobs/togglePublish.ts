import { array } from "@/utils";
import { spendJobCredit } from "../quotas/utils";

const canPublishStatus = ["draft", "declined", "closed", "pendingClosure"];
const canUnpublishStatus = ["pending", "published"];

export default async function togglePublish(ctx: Context) {
    const token = ctx.state.token;
    const { channelId, action } = ctx.request.body;
    const { tenantId, jobId } = ctx.params;

    const quota = await ctx.service('quotas').findOne({
        tenantId: tenantId
    })

    const findJob = quota.jobApplications.find(job => job.jobId.toString() === jobId)

    if (findJob.remainingApplications <= 0) {
        ctx.throw(400, 'Başvuru sayısı maksimuma ulaştı')
    }
    if (quota.job.remainingCredit <= 0 && action === "publish") {
        ctx.throw(400, 'İş ilanı  yayınlamak için lütfen paket alınız.')
    }


    const tenantMember = await ctx.service("tenantMembers").findOne({
        userId: ctx.state.user._id,
        tenantId
    });
    if (!tenantMember) return ctx.throw(403, "You're not a member of the tenant!");

    const channel = await ctx.service("postingChannels").findOne({
        _id: channelId,
        tenantId
    });

    if (!channel) return ctx.throw(400, "Not found published channel");

    const job = await ctx.service("jobs").findOne({
        _id: jobId,
        tenantId,
    });

    if (!job) return ctx.throw(404, "Not found the job!");

    const publishedChannelsOfJob = array<any>(job?.publishedChannels);
    const jobPublishedChannelIndex = publishedChannelsOfJob.findIndex(channel => channel?.channelId?.toString() === channelId);
    const channelDetail = publishedChannelsOfJob[jobPublishedChannelIndex];

    let payload: any = {
        channelId: channel._id.toString(),
        status: channelDetail ? channelDetail?.status : "draft"
    };
    if (!channelDetail) {
        if (action === "publish") {
            payload.status = channel?.isOwner ? "published" : "pending";
        } else if (action === "unpublish") {
            payload.status = "draft";
        }
    } else {
        if (action === "publish" && canPublishStatus.includes(payload.status)) {
            payload.status = channel?.isOwner ? "published" : "pending";
            payload.lastPublishedAt = channel?.isOwner ? new Date() : channelDetail?.lastPublishedAt;
        } else if (action === "unpublish" && canUnpublishStatus.includes(payload.status)) {
            payload.status = 'closed' // channel?.isOwner ? "draft" : "pendingClosure";
            payload.lastPublishedAt = channelDetail?.lastPublishedAt;
            const job = await ctx.service('jobs').findOne({ _id: jobId })
            await ctx.service('jobApplications').updateMany(
                { jobId: job._id, status: 'applied' },
                { $set: { status: 'disqualified' } }
            );


        } else {
            payload.status = channelDetail?.status;
        }
    }

    const updatedPublishedChannels = publishedChannelsOfJob.map((ch) =>
        ch.channelId?.toString() === channelId ? payload : ch
    );

    await ctx.service("jobs").update(jobId, {
        publishedChannels: updatedPublishedChannels
    });
    await spendJobCredit(ctx, jobId, tenantId, 1)

    ctx.body = {
        isSuccess: true,
    };
}
