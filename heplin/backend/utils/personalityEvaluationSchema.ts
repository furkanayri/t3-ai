import { z } from 'zod';

const TraitScore = z.object({
    score: z.number().describe('1 ile 10 arasında bir puan'),
});

export const PersonalityEvaluationSchema = z.object({
    perfectionism: TraitScore,
    ambition: TraitScore,
    motivation: TraitScore,
    desireForLeadership: TraitScore,
    strengths: z.object({
        tr: z.array(z.string()).describe("Güçlü yönlerin Türkçe listesi"),
        en: z.array(z.string()).describe("Güçlü yönlerin İngilizce listesi"),
    }).describe("Güçlü yönler listesi, Türkçe ve İngilizce olarak."),

    weaknesses: z.object({
        tr: z.array(z.string()).describe("Zayıf yönlerin Türkçe listesi"),
        en: z.array(z.string()).describe("Zayıf yönlerin İngilizce listesi"),
    }).describe("Zayıf yönler listesi, Türkçe ve İngilizce olarak."),
});
