
const pdf = require("pdf-parse");
import { Types } from "mongoose";
import { spendAiFeaturesCredit } from "../quotas/utils";
import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { CandidateEvaluationGeminiSchema } from "@/utils/candidateGeminiEvaluation";
import Ajv from "ajv";

export default async function createAiEvaluation(ctx: Context) {
  const { tenantId } = ctx.params;
  const { candidateId, jobId } = ctx.request.body;
  const fileStream = ctx.state.fileBuffer;

  const job = await ctx.service("jobs").findOne({ _id: jobId });

  const jobApplication = await ctx
    .service("jobApplications")
    .findOne({ candidateId: candidateId, jobId: jobId });

  const evaluateWithHeplin = await pdf(fileStream)
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

      const gptConvertJson = await GeminiChatCompletion(
        `
      Evaluate this candidate's suitability for the job based on the job description and CV provided.
      System: Follow these instructions below in all your responses:
      - Provide responses in both Turkish (tr) and English (en) separately.
      - Use Turkish language only for Turkish (tr) responses and English language only for English (en) responses.
      - Translate any other language to the respective response language whenever possible.`,
        JSON.stringify(payload),
        CandidateEvaluationGeminiSchema
      );
      const ajv = new Ajv();
      const validate = ajv.compile(CandidateEvaluationGeminiSchema);
      const valid = validate(gptConvertJson);

      if (!valid) {
        console.error(validate.errors);
        return ctx.throw(400, "Error parsing GPT response");
      }
      const res = {
        candidateId: jobApplication.candidateId,
        jobId: job._id,
        tenantId: tenantId,
        jobApplicationId: jobApplication._id,
        candidateScore: gptConvertJson?.candidateScore?.score,
        candidateStrengths:
          gptConvertJson?.candidateStrengths?.strengths.map(
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
        candidateMissing: gptConvertJson?.candidateMissing?.missing.map(
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
          tr: gptConvertJson?.candidateSummary?.summary?.tr,
          en: gptConvertJson?.candidateSummary?.summary?.en,
        },
        improvementSuggestions:
          gptConvertJson?.improvementSuggestions?.suggestions.map(
            (suggestion) => ({
              tr: suggestion?.tr,
              en: suggestion?.en,
            })
          ),
      };

      if (
        !res.jobId ||
        (typeof res.jobId !== "string" &&
          !(res.jobId instanceof Types.ObjectId))
      ) {
        return ctx.throw(400, "Job not found");
      }

      if (
        !res.jobApplicationId ||
        (typeof res.jobApplicationId !== "string" &&
          !(res.jobApplicationId instanceof Types.ObjectId))
      ) {
        return ctx.throw(400, "Job Application not found");
      }

      // After the check, we know res.jobId is of type `string | Types.ObjectId`
      await ctx.service("aiEvaluation").create({
        ...res,
        jobId: res.jobId as string | Types.ObjectId, // Explicit cast
        jobApplicationId: res.jobApplicationId as string | Types.ObjectId, // Explicit cast
      });
      await spendAiFeaturesCredit(ctx, tenantId, 'evaluation', 1)
      return gptConvertJson.data;
    })
    .catch((err) => {
      ctx.throw(400, "Error processing PDF")
    });
  ctx.body = { isSuccess: true, data: evaluateWithHeplin };
}
