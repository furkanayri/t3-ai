import { z } from "zod";

const BilingualField = z.object({
    tr: z.string().describe("Türkçe açıklama."),
    en: z.string().describe("İngilizce açıklama."),
});

const CandidateScore = z.object({
    score: z.number().describe("Rate the candidate's suitability for the job on a scale of 1 to 10."),
});

const DetailedStrength = z.object({
    strength: BilingualField.describe("A specific strength of the candidate."),
    description: BilingualField.describe("Detailed explanation of how this strength applies to the job."),
});

const CandidateStrengths = z.object({
    strengths: z.array(DetailedStrength).describe("List the candidate's strengths with detailed explanations."),
});

const DetailedMissing = z.object({
    skill: BilingualField.describe("A specific skill the candidate is missing."),
    description: BilingualField.describe("Detailed explanation of how this missing skill affects the candidate's suitability for the job."),
});

const CandidateMissing = z.object({
    missing: z.array(DetailedMissing).describe("List the candidate's missing skills with detailed explanations."),
});

const CandidateSummary = z.object({
    summary: BilingualField.describe("A brief summary of the candidate's overall suitability."),
});

const ImprovementSuggestions = z.object({
    suggestions: z.array(BilingualField).describe("Suggestions on how the candidate can improve their qualifications or skills."),
});

export const CandidateEvaluationSchema = z.object({
    candidateScore: CandidateScore,
    candidateStrengths: CandidateStrengths,
    candidateMissing: CandidateMissing,
    candidateSummary: CandidateSummary,
    improvementSuggestions: ImprovementSuggestions,
});
