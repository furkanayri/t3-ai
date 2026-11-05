import { CandidateEvaluationSchema } from "@/utils/candidateEvaluationSchema";
import { s3Client } from "@/utils";
import streamToBuffer from "stream-to-buffer";
import { GptChatCompletion } from "@/utils/GptCompletion";
const pdf = require("pdf-parse");
import { checkEvaluationQuota, spendAiFeaturesCredit } from '../quotas/utils';
export default async function aiEvaluation(ctx: Context) {
  let { jobId } = ctx.params;
  if (!jobId) {
    jobId = ctx.state.jobId;
  }
  const tenantId = ctx.state.tenantId;
  const userCvId = ctx.state.cv;
  const jobApplication = ctx.state.jobApplication;

  const job = await ctx.service("jobs").findOne({ _id: jobId });
  ctx.state.job = job;

  const cv = await ctx.service("cv").findOne({ _id: userCvId });
  const evaluationquota = await checkEvaluationQuota(ctx, tenantId)
  if (evaluationquota) {
    ctx.body = {
      success: false,
      message: "Evaluation quota limit reached.",
    };
    return;
  }



  // burası middleware ile yapılacak
  if (!cv.fileKey) return ctx.throw(400, "File key is required");

  const options = {
    Bucket: process.env.AWS_BUCKET_PRIVATE ?? "",
    Key: cv.fileKey,
  };

  ctx.attachment(cv.fileKey);

  const fileStream = s3Client
    .getObject(options)
    .createReadStream()
    .on("error", (error: any) => {
      return ctx.throw(500, error?.message);
    });
  let fileBuffer = await new Promise((resolve, reject) => {
    streamToBuffer(fileStream, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });

  const evaluateWithHeplin = await pdf(fileBuffer)
    .then(async (pdfData) => {
      const jsonJob = {
        title: job.title,
        description: job.content,
        jobType: job.jobType,
        location: job.locationType,
      };
      const jsonApplicantion = {
        coverLetter: jobApplication.coverLetter,
        applicantAnswers: jobApplication.applicantAnswers,
      };
      const payload = {
        ...jsonApplicantion,
        ...jsonJob,
        cv: pdfData.text,
      };

      const gptConvertJson = await GptChatCompletion(
        `
      Evaluate this candidate's suitability for the job based on the job description and CV provided.
      System: Follow these instructions below in all your responses:
      - Provide responses in both Turkish (tr) and English (en) separately.
      - Use Turkish language only for Turkish (tr) responses and English language only for English (en) responses.
      - Translate any other language to the respective response language whenever possible.`,
        JSON.stringify(payload),
        CandidateEvaluationSchema
      );
      const validationResult =
        CandidateEvaluationSchema.safeParse(gptConvertJson);

      const res: any = {
        candidateId: jobApplication.candidateId,
        jobId: job._id,
        tenantId: tenantId,
        jobApplicationId: jobApplication._id,
        candidateScore: validationResult?.data?.candidateScore?.score,
        candidateStrengths:
          validationResult?.data?.candidateStrengths?.strengths.map(
            (strength) => ({
              strength: {
                tr: strength?.strength?.tr,
                en: strength?.strength?.en,
              },
              description: {
                tr: strength?.description?.tr,
                en: strength?.description?.en,
              },
            })
          ),
        candidateMissing: validationResult?.data?.candidateMissing?.missing.map(
          (missing) => ({
            skill: {
              tr: missing?.skill?.tr,
              en: missing?.skill?.en,
            },
            description: {
              tr: missing?.description?.tr,
              en: missing?.description?.en,
            },
          })
        ),
        summary: {
          tr: validationResult?.data?.candidateSummary?.summary?.tr,
          en: validationResult?.data?.candidateSummary?.summary?.en,
        },
        improvementSuggestions:
          validationResult?.data?.improvementSuggestions?.suggestions.map(
            (suggestion) => ({
              tr: suggestion?.tr,
              en: suggestion?.en,
            })
          ),
      };

      //TODO: Response type is not matching with the return type of create method
      /**
        functions/jobs/aiInverviewInvitation.ts(28,77): error TS2345: Argument of type '{ name: string; userId: Types.ObjectId; jobAppicantId: unknown; candidateId: Types.ObjectId; jobId: unknown; aiInterviewId: unknown; }' is not assignable to parameter of type 'Partial<IInterviewAnswers>'.
        Types of property 'jobAppicantId' are incompatible.
        Type '{}' is missing the following properties from type 'ObjectId': _bsontype, id, toHexString, toJSON, and 4 more.
        functions/jobs/aiInverviewInvitation.ts(31,9): error TS2322: Type 'unknown' is not assignable to type 'ObjectId | IInterview'.
       */
      const aiEvaluation = await ctx.service('aiEvaluation').create({ ...res });
      await spendAiFeaturesCredit(ctx, tenantId, 'evaluation', 1)
      console.log('-------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

      return validationResult.data;
    })
    .catch((err) => {
      console.error("Error processing PDF:", err);
    });

  ctx.body = evaluateWithHeplin;
}
