import mongoose from "mongoose"
import { Types } from "mongoose";

export async function spendEmailCredit(ctx: Context, tenantId: string, count: number) {
    const quota = await ctx.service('quotas').findOne({
        tenantId,
    })
    const checkParentTenant = await ctx.service("tenants").findOne({
        _id: ctx.params.tenantId || tenantId
    })

    if (checkParentTenant.parentTenantId === null) {
        return
    }


    if (!quota) ctx.throw(400, 'Quota not found')
    if (!quota._id || (typeof quota._id !== 'string' && !(quota._id instanceof Types.ObjectId)))
        ctx.throw(404, "Invalid user id");

    quota.email.remainingCredit -= count
    await ctx.service('quotas').update(quota._id, quota)
}

export async function spendJobCredit(ctx: Context, jobId: string, tenantId: string, count: number) {
    const checkParentTenant = await ctx.service("tenants").findOne({
        _id: ctx.params.tenantId || tenantId
    })
    if (checkParentTenant.parentTenantId === null) {

        return
    }


    try {
        const quota = await ctx.service('quotas').findOne({ tenantId });

        quota.jobApplications.push({
            jobId: new mongoose.Types.ObjectId(jobId),
            totalLimit: 100,
            remainingApplications: 100,
        });
        quota.job.remainingCredit -= count;
        if (!quota._id || (typeof quota._id !== 'string' && !(quota._id instanceof Types.ObjectId)))
            ctx.throw(404, "Invalid user id");

        await ctx.service('quotas').update(quota._id, quota);

    } catch (error) {

        ctx.throw(404, "Error in spendJobCredit");
    }
}


export async function spendJobApplicationCredit(ctx: Context, jobId: string | Types.ObjectId, tenantId: string | Types.ObjectId, count: number) {

    const quota = await ctx.service('quotas').findOne({
        tenantId,
    })
    const checkParentTenant = await ctx.service("tenants").findOne({
        _id: ctx.params.tenantId || tenantId
    })
    if (checkParentTenant.parentTenantId === null) {

        return
    }

    if (!quota) ctx.throw(400, 'Quota not found')
    const findJob = quota.jobApplications.find(job => job.jobId.toString() === jobId.toString())
    if (!quota._id || (typeof quota._id !== 'string' && !(quota._id instanceof Types.ObjectId)))
        ctx.throw(404, "Invalid user id");

    findJob.remainingApplications -= count
    await ctx.service('quotas').update(quota._id, quota)
}


export async function spendAiFeaturesCredit(
    ctx: Context,
    tenantId: string,
    featureName: 'interview' | 'evaluation' | 'videoInterview',
    count: number
) {

    const checkParentTenant = await ctx.service("tenants").findOne({
        _id: ctx.params.tenantId || tenantId
    })
    if (checkParentTenant.parentTenantId === null) {

        return
    }

    const quota = await ctx.service('quotas').findOne({ tenantId });

    const feature = quota.aiFeatures[featureName];
    feature.remainingCount -= count;

    if (!quota._id || (typeof quota._id !== 'string' && !(quota._id instanceof Types.ObjectId)))
        ctx.throw(404, "Invalid user id");
    await ctx.service('quotas').update(quota._id, quota);
}
export async function checkEvaluationQuota(ctx, tenantId) {
    const quota = await ctx.service('quotas').findOne({ tenantId });
    const { remainingCount, isActive } = quota.aiFeatures.evaluation;
    if (!isActive) {
        return true
    }
    if (remainingCount <= 0) {
        return true
    }
    return false
}


