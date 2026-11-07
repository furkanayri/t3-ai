export default async function updateJob(ctx: Context) {
    const { tenantId, jobId } = ctx.params;
    const { employeeId, applicantId } = ctx.request.body;

    const existingJob = await ctx.service('jobs').findOne({ tenantId, _id: jobId });
    const existingHiringTeams = existingJob?.hiringTeams || [];

    const updatedJob = await ctx.service('jobs').updateOne({ tenantId, _id: jobId }, ctx.request.body);

    if (applicantId && employeeId) {
        const found = await ctx.service('jobApplications').findOne({ jobId: jobId, candidateId: applicantId })
        const res = await ctx.service('jobApplications').updateOne({ jobId: jobId, candidateId: applicantId }, { employeeId: employeeId });
    }
    const updatedHiringTeams = updatedJob.hiringTeams || [];

    const removedHiringTeamMembers = existingHiringTeams.filter(memberId =>
        !updatedHiringTeams.map(user => user._id.toString()).includes(memberId.toString())
    );

    for (const memberId of removedHiringTeamMembers) {
        const paginatedApplications = await ctx.service('jobApplications').findAll({
            jobId,
            employeeId: memberId,
        });

        const applications = paginatedApplications.results;

        for (const application of applications) {
            application.set('employeeId', null);
            await ctx.service('jobApplications').updateOne(application._id, application);
        }
    }
    ctx.body = {
        job: updatedJob
    };
}
