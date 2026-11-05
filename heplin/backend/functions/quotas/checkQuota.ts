
export default async function checkQuota(ctx: Context, options = {} as any) {
    const { target } = options
    const jobId = ctx.state.jobId
    const tenantId = ctx.state.tenantId

    if (!target) ctx.throw(500, 'Invalid quota implementation')

    const quota = await ctx.service('quotas').findOne({
        tenantId: ctx.params.tenantId || tenantId
    })
    const checkParentTenant = await ctx.service("tenants").findOne({
        _id: ctx.params.tenantId || tenantId
    })
    if (checkParentTenant.parentTenantId === null) {
        return
    }


    if (!quota) ctx.throw(400, 'Quota not found')


    if (target === "job" && quota.job.remainingCredit <= 0) {
        ctx.throw(400, 'joblimitexceeded')
    }

    if (target === "email" && quota.email.remainingCredit <= 0) {
        ctx.throw(400, 'emaillimitexceeded')
    }

    if (target === "jobapplicant") {
        const jobIdString = jobId?.toString() || ctx.params.jobId;
        const findJob = quota?.jobApplications?.find(job => job?.jobId?.toString() === jobIdString);


        if (findJob.remainingApplications <= 0) {
            const publishedChannelUpdate = await ctx.service('jobs').updateOne(
                {
                    _id: jobId,
                    tenantId: ctx.params.tenantId || tenantId
                },
                {
                    $set: {
                        "publishedChannels.$[].status": "closed"
                    }
                }
            );

        }
    }


    if (target === "interview") {
        const { videoInterview, interview } = quota.aiFeatures;

        const { type } = ctx.request.body
        if (type === 'video' && !videoInterview.isActive) {
            ctx.throw(400, 'Ai Video Mülakatı aktif değil');
        }
        if (type !== 'text' && !interview.isActive) {
            ctx.throw(400, 'Ai Mülakatı aktif değil');
        }

        const { remainingCount } = type === 'video' ? videoInterview : interview;

        if (remainingCount <= 0) {
            ctx.throw(400, 'Mülakat sınırına ulaşıldı');
        }

    }



    if (target === "evaluation") {

        const { remainingCount, isActive } = quota.aiFeatures.evaluation;

        if (!isActive) {
            ctx.throw(400, 'aiNotActive');
        }
        if (remainingCount <= 0) {
            ctx.throw(400, 'evaluationQuotanotExist');
        }
    }

}

