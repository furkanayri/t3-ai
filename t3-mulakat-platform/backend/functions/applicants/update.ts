import sendEmail from "@/utils/mail/sendMail";

export default async function hired(ctx: Context) {

  const { tenantId, jobId } = ctx.params;
  const { candidateId, status } = ctx.request.body;

  const payload = {
    status: status,
  };
  // just use for hire this update mutatation
  const res = await ctx.service("jobApplications").updateOne(
    {
      jobId: jobId,
      tenantId: tenantId,
      candidateId: candidateId,
    },
    payload
  );

  const tenant = await ctx.service("tenants").findOne({
    _id: tenantId,
  });
  const candidate = await ctx.service("candidates").findOne({
    _id: candidateId,
  });
  const job = await ctx.service('jobs').findOne({
    _id: jobId
  })

  await sendEmail(tenant.senderMailAddress, candidate.email, 'İşe Alım', 'hire', {
    name: candidate.name,
    jobName:job.title
  })




  ctx.body = {
    jobApplicant: res,
  };
}
