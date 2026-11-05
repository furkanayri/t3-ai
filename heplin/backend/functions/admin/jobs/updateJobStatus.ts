export default async function updateJobStatus(ctx: Context) {
    const { jobId } = ctx.params;
    const { status, channelId } = ctx.request.body;

    const job = await ctx.service("jobs").updateOne(
        { _id: jobId, 'publishedChannels.channelId': channelId },
        { $set: { 'publishedChannels.$.status': status } }
    );
    ctx.body = job;
}