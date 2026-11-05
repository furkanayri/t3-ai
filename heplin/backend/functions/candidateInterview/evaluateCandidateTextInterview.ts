import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { geminiEvaluaterAnswerSchema } from "@/utils/geminiInterviewSchema";

export default async function evaluateCandidateTextInterview(ctx: Context) {

    const { interviewId, candidateAnswersId } = ctx.params


    const candidateAnswers = await ctx.service("candidateInterviewAnswers").findOne({
        _id: candidateAnswersId
    })

    const combinedQA = candidateAnswers.interiewAnswers.map((qa, index) => ({
        questionNumber: index + 1,
        question: qa.question,
        answer: qa.answer
    }));

    const evaluater = await GeminiChatCompletion(
        `
            You are an AI recruiter evaluating a candidate's suitability for a job based on their interview responses.
            Consider how well the answers align with the job requirements, the depth of industry knowledge displayed, and the communication skills.

            For each question:

            Provide a detailed evaluation in Turkish ("tr") and English ("en").
            After evaluating all the questions:

            Provide an overall evaluation of the candidate's suitability for the role in both Turkish ("tr") and English ("en").
            Ensure that the evaluations are structured clearly and provide constructive insights into the candidate's performance.
            `,
        JSON.stringify({ answers: combinedQA }),
        geminiEvaluaterAnswerSchema
    );

    const questionCount = candidateAnswers.interiewAnswers.length;

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
        updatedData,
        status: "success",
    };
    ctx.body = { isSuccess: true };
}