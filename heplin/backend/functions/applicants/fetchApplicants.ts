
export default async function fetchApplicants(ctx: Context) {
    const { tenantId } = ctx.params;
    let query: any = {
        tenantId
    };
    const res = await ctx.service("jobApplications").findAll(query, {
        populate: [
            {
                path: "userId",
                select: "_id email name surname"
            },
            {
                path: "currentRecruitmentStepId",
                select: "_id title color"
            },
            {
                path: "candidateId",
                select: "_id userId createdAt updatedAt name surname"
            },
            {
                path: "jobId",
                select: "_id title"
            }
        ]
    })


    ctx.body = res
}