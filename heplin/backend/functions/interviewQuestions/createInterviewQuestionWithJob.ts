import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { interviewSchema } from "@/utils/geminiInterviewSchema";
import { defaultPrompt, EnglishDefault } from "@/utils/interviewSchema";

export default async function createInterviewQuestionWithJob(ctx: Context) {
    const { jobId } = ctx.params
    const { numberOfQuestions, lang } = ctx.request.body



    const job = await ctx.service('jobs').findById(jobId)
    const checkLang = lang === 'en' ? EnglishDefault : defaultPrompt



    const jobQuestions = await GeminiChatCompletion(
        `
        You are an artificial intelligence that generates job-specific interview questions based on job descriptions.
        The candidate's technical knowledge for this job posting needs to be tested.
        To do this, ask the candidate ${numberOfQuestions} technical questions appropriate to the advertisement.
        ${checkLang}
        `, JSON.stringify(job), interviewSchema)

    ctx.body = jobQuestions
}
