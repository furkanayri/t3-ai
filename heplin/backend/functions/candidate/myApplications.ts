export default async function getAllApplicationsOfUser(ctx: Context) {
    const userId = ctx.state.user._id;

    const jobApplications = await ctx.service("jobApplications").findAll({
        userId
    }, {
        populate: [
            {
                path: "jobId",
                select: "title jobType locationType country city district"
            },
            {
                path: "currentRecruitmentStepId",
                select: "_id title color"
            },
            {
                path: "tenantId",
                select: "name logo"
            },
            {
                path: "onboardingId",
                select: "_id status"
            }
        ]
    })

    ctx.body = jobApplications;
}
