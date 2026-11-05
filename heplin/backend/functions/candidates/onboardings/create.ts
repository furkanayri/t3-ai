import { ICandidateOnboarding } from "@/types/entities";
import sendEmail from "@/utils/mail/sendMail";
import { Types } from "mongoose";
export default async function createCandidateEvaluations(ctx: Context) {
  const { tenantId } = ctx.params;
  const {
    candidateId,
    employeeId,
    jobId,
    jobApplicationId,
    onboardingWorkflowId,
    amountAndCurrency,
  } = ctx.request.body;

  const application = await ctx
    .service("jobApplications")
    .findById(jobApplicationId);
  if (!application) ctx.throw(404, "Job application not found");

  const payload: Partial<ICandidateOnboarding> = {
    candidateId,
    employeeId,
    tenantId,
    jobId,
    jobApplicationId,
    onboardingWorkflowId,
    status: "pending",
    responses: [],
    amountAndCurrency: [amountAndCurrency],
  };

  const candidateOnboarding = await ctx
    .service("candidateOnboardings")
    .create(payload);



  if (!application._id || (typeof application._id !== 'string' && !(application._id instanceof Types.ObjectId))) {
    ctx.throw(404, "Invalid application id");
  }

  const updatedApplication = await ctx
    .service("jobApplications")
    .update(application?._id, {
      onboardingId: candidateOnboarding._id,
      status: "onBoarding",
    });

  const tenant = await ctx.service("tenants").findOne({
    _id: tenantId,
  });
  const candidate = await ctx.service("candidates").findOne({
    _id: candidateId,
  });
  const job = await ctx.service("jobs").findOne({
    _id: jobId,
  });

  await sendEmail(
    tenant.senderMailAddress,
    candidate.email,
    "Onboarding",
    "onboarding",
    {
      jobTitle: job.title,
      name: candidate.name,
    }
  );

  ctx.body = { candidateOnboarding, application: updatedApplication };
}
