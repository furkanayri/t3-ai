import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { geminiAnswerSchema } from "@/utils/geminiInterviewSchema";
import { answerSchema, defaultPrompt } from "@/utils/interviewSchema";

export default async function updateCandidateAnswers(ctx: Context) {
    const id = ctx.params.candidateAnswerId;

    const {
        questionId,
        responseTime,
        answer,
        fileKey,
        question,
        questionIndex,
    }: any = ctx.request.body;

    let evaluatedAnswer = "";
    let candidateAnswer = answer;

    if (!answer || answer.trim() === "") {
        candidateAnswer = "Cevap verilmedi";
        evaluatedAnswer = "Değerlendirme yapılmadı.";
    } else {
        const evaluater = await GeminiChatCompletion(
            `
        As an AI recruiter, respond directly to the candidate based on their interview answer. Provide feedback on their response as if you are speaking to them.
        Question: "${JSON.stringify(question)}"
        Candidate's Answer: "${JSON.stringify(answer)}"
        ${defaultPrompt}
      `,
            JSON.stringify(answer),
            geminiAnswerSchema,
            0.8
        );
        evaluatedAnswer = evaluater.interviewEvaluate;
    }




    if (questionIndex) {
        const candidateInterview = await ctx.service("candidateInterview").updateOne(
            { candidateAnswersId: id },
            { questionIndex: questionIndex }
        );
    }

    const payload = {
        questionId,
        responseTime,
        answer: candidateAnswer,
        fileKey,
        evaluateAnswer: evaluatedAnswer,
        question,
    };

    const interviewAnswer = await ctx.service("candidateInterviewAnswers").updateOne(
        { _id: id },
        { $push: { interiewAnswers: payload } }
    );

    ctx.body = { success: true };
}
