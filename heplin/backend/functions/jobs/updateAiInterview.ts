export default async function updateAiInterview(ctx: Context) {
    const id = ctx.params.jobId;

    const interview = await ctx.service('interview').updateOne({ jobId: id }, ctx.request.body);

    ctx.body = interview;
}