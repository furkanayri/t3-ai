export default async function getOnePublicJob(ctx: Context) {
    const job = await ctx.service("jobs").findOne({
        _id: ctx.params.jobId
    })

    ctx.body = { job };
}