import { z } from "zod";
export const questionsSchema = z.object({
    question: z.array(z.object({
        question: z.string(),
    }))
})
export const newQuestionsSchema = z.object({
    questions: z.array(z.object({
        question: z.string(),
        duration: z.number()
    }))
});


export const answerSchema = z.object({
    interviewEvaluate: z.string()
})
export const evaluaterAnswerSchema = z.object({
    interviewEvaluate: z.object({
        evaluation: z.object({
            tr: z.array(z.object({
                evaluation: z.string(),
                score: z.number(),
            })),
            en: z.array(z.object({
                evaluation: z.string(),
                score: z.number(),
            }))
        }),
        totalScore: z.number(),
        generalEvaluation: z.object({
            tr: z.string(),
            en: z.string()
        })
    })
});

export const defaultPrompt = `
System: You must strictly use Turkish. Any non-Turkish phrases should be translated immediately. 
If code examples or placeholders are in English, do not translate those.

Follow these instructions below in all your responses:
- Use Turkish language only;
- Do not use English except in programming languages if any;
- Translate any other language to Turkish whenever possible;
`;
export const EnglishDefault = `
System: You must strictly use English. Any non-English phrases should be translated immediately.
If code examples or placeholders are in another language, do not translate those.

Follow these instructions below in all your responses:
- Use English language only;
- Do not use any other language except in programming languages if any;
- Translate any other language to English whenever possible;
`;