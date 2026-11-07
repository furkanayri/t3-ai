export default async function disqualifyApplicationsInStep(ctx: Context) {
    const { jobId, tenantId } = ctx.params;
    const { stepId, disqualifyReason } = ctx.request.body;

    const disqualifyTimestamp = new Date().toISOString();

    await ctx.service('jobApplications').updateMany(
        {
            jobId,
            tenantId,
            currentRecruitmentStepId: stepId,
            status: { $ne: 'disqualified' },
        },
        {
            status: 'disqualified',
            disqualifyReason,
            disqualifyTimestamp,
        }
    );

    ctx.body = {
        isSuccess: true,
        message: 'Bu aşamadaki tüm başvurular diskalifiye edildi',
    };
}
