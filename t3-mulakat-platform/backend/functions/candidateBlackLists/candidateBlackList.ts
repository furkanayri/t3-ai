import { Types } from "mongoose";

export default async function candidateBlackLists(ctx: Context) {
  const { jobId, tenantId } = ctx.params;
  const { candidateId, applicationId, reason } = ctx.request.body;

  const candidate = await ctx.service("candidates").findOne({
    _id: candidateId,
    tenantId,
  });
  if (!candidate) {
    return ctx.throw(404, "Candidate not found", { candidateId });
  }

  const user = await ctx.service("users").findOne({ _id: candidate.userId });
  if (!user) {
    ctx.throw(404, "Candidate's user information was not found", {
      candidateId,
    });
  }

  const jobApplication = await ctx.service("jobApplications").findOne({
    _id: applicationId,
    jobId,
    tenantId,
    candidateId,
  });
  if (!jobApplication) {
    ctx.throw(404, "Job application not found", { applicationId });
  }

  const application = await ctx
    .service("jobApplications")
    .findOne({ _id: applicationId });

  await ctx.service("tenants").updateOne(
    { _id: tenantId },
    {
      $push: {
        blacklistedCandidates: candidateId,
      },
    }
  );

  const existingBlackList = await ctx.service("candidateBlackLists").findOne({
    candidateId,
    tenantId,
    isRemoveBlackList: false,
  });

  if (existingBlackList) {
    ctx.throw(400, "Candidate is already blacklisted for this tenant", {
      candidateId,
      tenantId,
    });
  }

  if (
    !application?.id ||
    (typeof application?.id !== "string" &&
      !(application?.id instanceof Types.ObjectId))
  ) {
    ctx.throw(404, "Application id is invalid");
  }

  await ctx.service("candidateBlackLists").create({
    candidateId,
    tenantId,
    jobId,
    reason,
    jobApplicationId: (application?._id ?? "") as string,
  });

  ctx.body = {
    isSuccess: true,
  };
}
