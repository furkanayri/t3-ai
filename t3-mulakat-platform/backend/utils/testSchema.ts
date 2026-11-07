import { z } from 'zod';

export const QuestionWithAnswers = z.object({
    question: z.string().describe("The question text"),
    options: z.object({
        A: z.string().describe("Option A"),
        B: z.string().describe("Option B"),
        C: z.string().describe("Option C"),
        D: z.string().describe("Option D"),
        E: z.string().describe("Option E"),
    }).describe("The answer options for the question"),
    trait: z.string().describe("Personality trait measured by the question")
});

export const QuestionsArraySchema = z.object({
    questions: z.array(QuestionWithAnswers).describe("Array of questions with answer options"),
});
