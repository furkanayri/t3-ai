export default async function moveCandidateStep(ctx: Context) {
    const { jobId, tenantId, applicantId } = ctx.params

    const { currentRecruitmentStepId: newStepId } = ctx.request.body

    const jobApplication = await ctx.service("jobApplications").findOne({
        jobId,
        tenantId,
        _id: applicantId
    })

    if (!jobApplication) {
        return ctx.throw(404, "Job application not found")
    }

    const recruitmentStep = await ctx.service("recruitmentStageSteps").findOne({
        _id: newStepId,
        tenantId
    })

    if (!recruitmentStep) {
        return ctx.throw(404, "Recruitment step not found")
    }

    await ctx.service("jobApplications").updateOne({
        _id: jobApplication._id,
        tenantId
    }, {
        currentRecruitmentStepId: newStepId
    })

    ctx.body = {
        isSuccess: true
    }
}