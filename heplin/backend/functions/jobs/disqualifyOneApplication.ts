export default async function disqualifyOneApplication(ctx: Context) {
  const { jobId, tenantId } = ctx.params;
  const { candidateId, applicationId, disqualifyReason } = ctx.request.body;


  let disqualifyTimestamp = new Date().toISOString();

  const candidate = await ctx.service("candidates").findOne({
    _id: candidateId,
    tenantId,
  });
  if (!candidate) {
    return ctx.throw(404, "Candidate not found", { candidateId });
  }

  const user = await ctx.service("users").findOne({ _id: candidate.userId });

  if (!user)
    ctx.throw(404, "Candidate's user information was not found", {
      candidateId,
    });

  const tenant = await ctx.service("tenants").findOne({
    _id: tenantId
  });

  const jobApplication = await ctx.service("jobApplications").findOne({
    _id: applicationId,
    jobId,
    tenantId,
    candidateId,
  });
  if (!jobApplication)
    ctx.throw(404, "Job application not found", { applicationId });

  await ctx
    .service("jobApplications")
    .updateOne({ _id: jobApplication._id, tenantId },
      {
        status: 'disqualified',
        disqualifyReason,
        disqualifyTimestamp,  

      });

  ctx.state.sender = tenant?.senderMailAddress;
  ctx.state.recipient = user?.email;

  ctx.body = {
    isSuccess: true,
    isEmailSent: true,
  };
}
