import { Types } from "mongoose";

export default async function updateJob(ctx: Context) {
    const { jobId } = ctx.params;
    const payload = ctx.request.body;

    const existingJob = await ctx.service("jobs").findOne({ _id: jobId });
    if (!existingJob) return ctx.throw(404, "Job not found");

    const job = await ctx.service("jobs").updateOne({ _id: existingJob?._id }, payload);

    ctx.body = job;
}