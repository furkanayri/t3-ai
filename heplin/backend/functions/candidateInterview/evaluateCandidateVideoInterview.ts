import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { geminiEvaluaterAnswerSchema } from "@/utils/geminiInterviewSchema";
import { s3Client } from "@/utils";
import { transcribeVideo } from "@/utils/videoInterview";


export default async function evaluateCandidateVideoInterview(ctx: Context) {
    const { interviewId, candidateAnswersId } = ctx.params
    try {
        const candidateInterview = await ctx.service("candidateInterview").findOne({
            _id: interviewId
        });

        const interviewQuestions = await ctx.service("interviewQuestions").findOne({
            interviewId: candidateInterview.interviewId
        });

        const candidateAnswers = await ctx.service("candidateInterviewAnswers").findOne({
            _id: candidateAnswersId
        })


        if (!candidateAnswers || !candidateAnswers.interiewAnswers || candidateAnswers.interiewAnswers.length === 0) {
            console.warn(
                "No questions and answers found for the given videoInterviewId and candidateId"
            );
            ctx.body = {
                score: null,
                evaluate: {
                    tr: "",
                    en: "",
                },
                status: "no_questions_found",
            };
            return;
        }

        const transcriptionPromises = candidateAnswers.interiewAnswers.map(async (qa: any) => {
            if (!qa.fileKey) {
                console.warn(`No fileKey found for question ${qa.questionId}`);
                return {
                    questionId: qa.questionId,
                    responseTime: qa.responseTime,
                    fileKey: qa.fileKey,
                    question: qa.question,
                    ...(qa._id && { _id: qa._id }),
                    transcription: { text: "" },
                    answer: ""
                };
            }

            try {
                const s3Object = await s3Client.getObject({
                    Bucket: process.env.AWS_BUCKET_PRIVATE,
                    Key: qa.fileKey,
                }).promise();

                if (!s3Object.Body) {
                    console.warn(`Video not found in storage for ${qa.fileKey}`);
                    return {
                        questionId: qa.questionId,
                        responseTime: qa.responseTime,
                        fileKey: qa.fileKey,
                        question: qa.question,
                        ...(qa._id && { _id: qa._id }),
                        transcription: { text: "" },
                        answer: ""
                    };
                }

                const videoBuffer = Buffer.from(s3Object.Body as Buffer);

                const transcription = await transcribeVideo(
                    videoBuffer,
                    qa.fileKey,
                    s3Object.ContentType || "video/webm"
                );


                return {
                    questionId: qa.questionId,
                    responseTime: qa.responseTime,
                    fileKey: qa.fileKey,
                    question: qa.question,
                    ...(qa._id && { _id: qa._id }),
                    transcription,
                    answer: transcription.text
                };
            } catch (error) {
                console.error(`Transcription failed for question ${qa.questionId}:`, error);
                return {
                    questionId: qa.questionId,
                    responseTime: qa.responseTime,
                    fileKey: qa.fileKey,
                    question: qa.question,
                    ...(qa._id && { _id: qa._id }),
                    transcription: { text: "" },
                    answer: ""
                };
            }
        });

        const transcribedAnswers = await Promise.all(transcriptionPromises);

        transcribedAnswers.forEach((ans, idx) => {
            console.log(`Answer ${idx + 1}:`, {
                questionId: ans.questionId,
                hasTranscription: !!ans.transcription,
                transcriptionText: ans.transcription?.text?.substring(0, 50),
                hasAnswer: !!ans.answer,
                fileKey: ans.fileKey
            });
        });

        const updateResult = await ctx.service("candidateInterviewAnswers").updateOne(
            { _id: candidateAnswersId },
            {
                $set: {
                    interiewAnswers: transcribedAnswers,
                    updatedAt: new Date()
                }
            }
        );

        const interviewData = transcribedAnswers.map((qa, index) => {
            const questionDetail = interviewQuestions?.questions?.find(
                (q: any) => q._id.toString() === qa.questionId
            );

            return {
                questionNumber: index + 1,
                question: qa.question,
                answer: qa.transcription?.text || qa.answer || "",
                questionId: qa.questionId,
                evaluationCriteria: questionDetail?.evaluationCriteria || null
            };
        });

        let evaluationPrompt = `
            You are an AI recruiter evaluating a candidate's suitability for a job based on their interview responses.
            Consider how well the answers align with the job requirements, the depth of industry knowledge displayed, and the communication skills.

            For each question:
            - Provide a detailed evaluation in Turkish ("tr") and English ("en").
            - Give a score out of 10 for each response.
            - Include the questionId for each evaluation so we can match the evaluation to the original question.
        `;

        const questionsWithCriteria = interviewData.filter(q => q.evaluationCriteria);
        if (questionsWithCriteria.length > 0) {
            evaluationPrompt += `\n\n⚠️ IMPORTANT - SPECIAL EVALUATION CRITERIA:
            Some questions have specific evaluation criteria that should be given extra weight in scoring:
            
            ${questionsWithCriteria.map(q => `
            - Question ${q.questionNumber} (ID: ${q.questionId}):
              Special Criteria: "${q.evaluationCriteria}"
              → If the answer aligns with this criteria, give bonus points (up to +2 points)
              → If the answer contradicts this criteria, deduct points (up to -2 points)
            `).join('\n')}
            `;
        }

        evaluationPrompt += `
            
            After evaluating all the questions:
            - Provide an overall evaluation of the candidate's suitability for the role in both Turkish ("tr") and English ("en").
            - Ensure that the evaluations are structured clearly and provide constructive insights into the candidate's performance.
        `;

        const evaluater = await GeminiChatCompletion(
            evaluationPrompt,
            JSON.stringify({ interviewData }),
            geminiEvaluaterAnswerSchema
        );
        const questionCount = transcribedAnswers.length;

        const maxScore = questionCount * 10;

        const totalScore = evaluater.interviewEvaluate.evaluation.en
            .reduce((sum, item) => sum + item.score, 0);

        const evaluationScore = (totalScore / maxScore) * 100;

        const updatedData = await ctx.service("candidateInterview").updateOne(
            { _id: interviewId },
            {
                $set: {
                    interviewEvaluate: {
                        evaluation: {
                            tr: evaluater.interviewEvaluate.evaluation.tr,
                            en: evaluater.interviewEvaluate.evaluation.en,
                        },
                        generalEvaluation: {
                            tr: evaluater.interviewEvaluate.generalEvaluation.tr,
                            en: evaluater.interviewEvaluate.generalEvaluation.en
                        },
                        totalScore: evaluater.interviewEvaluate.totalScore
                    },
                    evaluationScore: Math.round(evaluationScore),
                    isEvaluated: true
                },
            }
        );
        ctx.body = {
            // updatedData,
            status: "success",
        };
    } catch (error) {
        console.error('Evaluation process failed:', error);
        ctx.body = {
            status: "error",
            message: error.message || 'Unknown error occurred',
        };
    }

}