import { CandidateEvaluationSchema } from "@/utils/candidateEvaluationSchema";
const pdf = require("pdf-parse");
import { Types } from "mongoose";
import { spendAiFeaturesCredit } from "../quotas/utils";
import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { CandidateEvaluationGeminiSchema } from "@/utils/candidateGeminiEvaluation";

export default async function createArchiveAiEvaluation(ctx: Context) {
    const { tenantId } = ctx.params;
    const { candidateId, jobId } = ctx.request.body;
    console.log("candidateId", candidateId);
    console.log("jobId", jobId);
    console.log("fileStream", ctx.state.fileBuffer);
    console.log("tenantId", tenantId);
    const fileStream = ctx.state.fileBuffer;

    const job = await ctx.service("archiveJobs").findOne({ _id: jobId });

    const jobApplication = await ctx
        .service("jobApplicationsArchives")
        .findOne({ candidateId: candidateId, jobId: jobId });
    console.log("jobApplication", jobApplication);
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
            const validationResult =
                CandidateEvaluationSchema.safeParse(gptConvertJson);

            if (!validationResult.success) {
                return ctx.throw(400, "Error parsing GPT response");
            }

            const res = {
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

            console.log("res", res);


            //TODO: ArchiveAiEvaluation.create method is not returning the correct type


            // After the check, we know res.jobId is of type `string | Types.ObjectId`
            await ctx.service("archiveAiEvaluation").create({
                ...res,
                jobId: res.jobId as string | Types.ObjectId, // Explicit cast
                jobApplicationId: res.jobApplicationId as string | Types.ObjectId, // Explicit cast
            });

            return validationResult.data;
        })
        .catch((err) => {
            ctx.throw(400, "Error processing PDF")
        });
    ctx.body = { isSuccess: true, data: evaluateWithHeplin };
}
