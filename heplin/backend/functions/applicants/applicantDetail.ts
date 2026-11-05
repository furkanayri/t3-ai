export default async function applicantDetail(ctx: Context) {
    const { jobId, candidateId } = ctx.params;
    const applicantDetail = await ctx.service('jobApplications').findOne({
        jobId: jobId,
        candidateId: candidateId
    },
        {
            populate: [
                {
                    path: 'jobId',
                    select: 'aiInterviewConfig aiInterview'
                }
            ]
        }
    );


    ctx.body = applicantDetail
}