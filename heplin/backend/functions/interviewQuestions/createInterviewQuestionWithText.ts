import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { interviewSchema } from "@/utils/geminiInterviewSchema";
import { defaultPrompt, newQuestionsSchema, EnglishDefault } from "@/utils/interviewSchema";

export default async function createInterviewQuestionWithText(ctx: Context) {
    const { jobId } = ctx.params
    const { numberOfQuestions, prompt, lang } = ctx.request.body

    const checkLang = lang === 'en' ? EnglishDefault : defaultPrompt
    const jobQuestions = await GeminiChatCompletion(
        `
        You are an artificial intelligence that generates questions based on the given title and instructions.
        Your goal is to create questions that align with the user's context and effectively evaluate the candidate.
        Ensure the questions are clear, concise, and precise.
        To do this, ask the candidate ${numberOfQuestions} questions relevant to the job and the given instructions.
        The questions should effectively measure the candidate's competencies and meet the requirements of the provided context.
        Make sure each question is clear, concise, and precise.
        ${checkLang}
        `, prompt, interviewSchema)


    ctx.body = jobQuestions
}
