import slugify from "@/utils/slugify";


export default async function createArchiveJob(ctx: Context) {
    console.log("veri buraya geldi")
    ctx.request.body.tenantId = ctx.params.tenantId;
    ctx.request.body.createdBy = ctx.state.user?._id;
    ctx.request.body.status = 'active';
    ctx.request.body.slug = slugify(ctx.request.body.title)
    const job = await ctx.service('archiveJobs').create(ctx.request.body);
    console.log("job", job)


    ctx.state.job = job;
    ctx.body = job
}