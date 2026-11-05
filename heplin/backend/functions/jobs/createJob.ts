import slugify from "@/utils/slugify";
import { spendJobCredit } from "../quotas/utils";

export default async function createJob(ctx: Context) {
    ctx.request.body.tenantId = ctx.params.tenantId;
    ctx.request.body.createdBy = ctx.state.user?._id;
    ctx.request.body.status = 'active';
    ctx.request.body.slug = slugify(ctx.request.body.title)
    const job = await ctx.service('jobs').create(ctx.request.body);
    await spendJobCredit(ctx, job._id, ctx.params.tenantId, 1)
    ctx.state.job = job;
    ctx.body = job
}