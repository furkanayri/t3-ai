export default async function getAiInterviewById(ctx: Context) {
    const id = ctx.params.jobId;
    const interview = await ctx.service('interview').findOne({ jobId: id });
    ctx.body = interview;
}