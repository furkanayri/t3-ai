import { Types } from "mongoose";
import createDefaultCandidateProfile from "@/utils/createDefaultCandidateProfile";
import { array } from "@/utils";
import { spendJobApplicationCredit } from "@/functions/quotas/utils";

export default async function apply(ctx: Context, options = {} as any) {
  const params = ctx.params;
  const mode = options?.mode ?? "candidate";

  let userId;
  let jobId;
  if (mode === "candidate") {
    userId = ctx.state.user._id;
    jobId = params.jobId;
  }
  if (mode === "admin") {
    userId = ctx.request.body.userId;
    jobId = ctx.request.body.jobId;
  }

  const userRes = await ctx.service("users").findById(userId);

  if (!userRes) {
    return ctx.throw(404, "User not found");
  }

  const name = userRes?.name;
  const surname = userRes?.surname;
  const email = userRes?.email;

  const { coverLetter, cv } = ctx.request.body;
  const applicantAnswers = array<any>(ctx.request.body.applicantAnswers);

  const job = await ctx.service("jobs").findOne(
    {
      _id: mode === "candidate" ? jobId : ctx.request.body.jobId,
      status: "active",
    },
    {
      populate: [
        {
          path: "tenantId",
          select: "_id subdomain",
        },
      ],
    }
  );

  if (!job) {
    return ctx.throw(404, "Job not found");
  }

  const jobQuestions = array<any>(job.applicantForm);

  const calculatedApplicantAnswers = jobQuestions.map((question) => {
    const result = applicantAnswers.find((applicantAnswer) => {
      return (
        applicantAnswer?.questionId?.toString() === question._id.toString()
      );
    });

    const answer = result?.answer;

    let isMatching = undefined;

    if (question.options?.expectedAnswer) {
      switch (question.type) {
        case "trueFalse":
          answer?.toString() === question?.options?.expectedAnswer
            ? (isMatching = true)
            : (isMatching = false);
          break;
        case "choice":
          question?.options?.expectedAnswer?.includes(answer)
            ? (isMatching = true)
            : (isMatching = false);
          break;
        case "multipleChoice":
          question?.options?.expectedAnswer?.includes(answer)
            ? (isMatching = true)
            : (isMatching = false);
          break;
        case "price":
          if (
            answer <=
            Math.max(
              question.options?.expectedAnswer?.min,
              question.options?.expectedAnswer?.max
            )
          ) {
            isMatching = true;
          }
          break;
        default:
          break;
      }
    }

    return {
      questionId: question._id,
      answer,
      isMatching,
    };
  });

  const hasExpectedAnswersLength = jobQuestions.filter(
    (a) => a.options?.expectedAnswer
  ).length;

  const matchingScore =
    hasExpectedAnswersLength > 0
      ? (calculatedApplicantAnswers.filter((answer) => answer.isMatching)
        .length /
        hasExpectedAnswersLength) *
      100
      : 0;

  const recruitmentStage = await ctx.service("recruitmentStages").findOne({
    _id: job.recruitmentStageId,
  });

  if (!recruitmentStage) {
    return ctx.throw(404, "Recruitment stage not found");
  }

  if (recruitmentStage.stepsSort.length <= 0) {
    return ctx.throw(404, "Recruitment stage steps not found");
  }

  const step = recruitmentStage.stepsSort[0];

  const tenantId =
    job.tenantId instanceof Types.ObjectId
      ? job.tenantId
      : (job.tenantId as any)?._id;

  const subdomain =
    job.tenantId instanceof Types.ObjectId
      ? job.tenantId
      : (job.tenantId as any)?.subdomain;

  const isExistApplication = await ctx.service("jobApplications").findOne({
    userId,
    jobId,
  });

  if (isExistApplication) {
    if (isExistApplication.status === "cancelledByCandidate") {
      return ctx.throw(400, "You have cancelled your application for this job");
    } else {
      return ctx.throw(400, "You have already applied for this job");
    }
  }

  await ctx
    .service("jobs")
    .updateOne({ _id: jobId }, { $inc: { applicationNumber: 1 } });

  //TODO: tenantId does not want type of unkown or null
  // functions/candidate/jobs/apply.ts(150,9): error TS2322: Type 'unknown' is not assignable to type 'string'.
  if (!tenantId && typeof tenantId !== "string") {
    return ctx.throw(400, "TenantId is required");
  }

  // If user has not candidate profile, then create one
  const candidateId = await createDefaultCandidateProfile(ctx, {
    userId,
    tenantId,
    name,
    surname,
    email,
  });

  const employeeApplicationCounts = await Promise.all(
    job.hiringTeams.map(async (employeeId) => {
      const count = await ctx.service("jobApplications").count({
        jobId,
        employeeId,
      });
      return { employeeId, count };
    })
  );

  let leastAssignedEmployee = employeeApplicationCounts[0];
  for (const employee of employeeApplicationCounts) {
    if (employee.count < leastAssignedEmployee.count) {
      leastAssignedEmployee = employee;
    }
  }

  const employeeId = leastAssignedEmployee.employeeId;

  //TODO: Add validation for jobApplication because it does not want type of unkown or null
  /**
   *    functions/candidate/jobs/apply.ts(184,5): error TS2740: Type '{}' is missing the following properties from type 'ObjectId': _bsontype, id, toHexString, toJSON, and 4 more.
        functions/candidate/jobs/apply.ts(190,5): error TS2740: Type '{}' is missing the following properties from type 'ObjectId': _bsontype, id, toHexString, toJSON, and 4 more.
        functions/candidate/jobs/apply.ts(191,5): error TS2740: Type '{}' is missing the following properties from type 'ObjectId': _bsontype, id, toHexString, toJSON, and 4 more. 
   */

  if (!candidateId || (typeof candidateId !== 'string' && !(candidateId instanceof Types.ObjectId))) {
    return ctx.throw(400, "CandidateId is required");
  }

  const jobApplication = await ctx.service("jobApplications").create({
    candidateId,
    userId,
    jobId,
    coverLetter,
    cv,
    applicantAnswers: calculatedApplicantAnswers,
    currentRecruitmentStepId:
      step instanceof Types.ObjectId ? step : ((step as any)?._id as any),
    tenantId,
    surname,
    name,
    employeeId,
    matchingScore,
  });
  ctx.state.jobApplication = jobApplication;
  ctx.state.tenantId = tenantId;
  ctx.state.cv = cv;
  ctx.state.job = jobId
  await spendJobApplicationCredit(ctx, jobId, tenantId, 1)
  const notificationPayload = {
    UserId: job.createdBy,
    title: `Yeni bir iş başvurusu aldınız`,
    content: `Merhabalar, ${name} ${surname} adlı kullanıcı ${job.title} pozisyonu için başvuru yaptı. Başvuruyu incelemek için tıklayınız.`,
    link: `${subdomain}/jobs/${jobId}/all-applicants?candidateId=${candidateId}`,
    isRead: false,
    buttonLabel: "jobs",
  };

  const notification = await ctx
    .service("notifications")
    .create(notificationPayload);

  ctx.body = {
    isSuccess: true,
  };
}
