import { SchemaType } from "@google/generative-ai";

export const CandidateEvaluationGeminiSchema = {
    description: "Candidate evaluation schema",
    type: SchemaType.OBJECT,
    properties: {
        candidateScore: {
            type: SchemaType.OBJECT,
            properties: {
                score: {
                    type: SchemaType.NUMBER,
                    description: "Rate the candidate's suitability for the job on a scale of 1 to 10.",
                    nullable: false,
                },
            },
            required: ["score"],
        },
        candidateStrengths: {
            type: SchemaType.OBJECT,
            properties: {
                strengths: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            strength: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    tr: {
                                        type: SchemaType.STRING,
                                        description: "Candidate's strength in Turkish.",
                                        nullable: false,
                                    },
                                    en: {
                                        type: SchemaType.STRING,
                                        description: "Candidate's strength in English.",
                                        nullable: false,
                                    },
                                },
                                required: ["tr", "en"],
                            },
                            description: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    tr: {
                                        type: SchemaType.STRING,
                                        description: "Detailed explanation of how this strength applies to the job in Turkish.",
                                        nullable: false,
                                    },
                                    en: {
                                        type: SchemaType.STRING,
                                        description: "Detailed explanation of how this strength applies to the job in English.",
                                        nullable: false,
                                    },
                                },
                                required: ["tr", "en"],
                            },
                        },
                        required: ["strength", "description"],
                    },
                    description: "List the candidate's strengths with detailed explanations.",
                },
            },
            required: ["strengths"],
        },
        candidateMissing: {
            type: SchemaType.OBJECT,
            properties: {
                missing: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            skill: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    tr: {
                                        type: SchemaType.STRING,
                                        description: "Candidate's missing skill in Turkish.",
                                        nullable: false,
                                    },
                                    en: {
                                        type: SchemaType.STRING,
                                        description: "Candidate's missing skill in English.",
                                        nullable: false,
                                    },
                                },
                                required: ["tr", "en"],
                            },
                            description: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    tr: {
                                        type: SchemaType.STRING,
                                        description: "Detailed explanation of how this missing skill affects the candidate's suitability in Turkish.",
                                        nullable: false,
                                    },
                                    en: {
                                        type: SchemaType.STRING,
                                        description: "Detailed explanation of how this missing skill affects the candidate's suitability in English.",
                                        nullable: false,
                                    },
                                },
                                required: ["tr", "en"],
                            },
                        },
                        required: ["skill", "description"],
                    },
                    description: "List the candidate's missing skills with detailed explanations.",
                },
            },
            required: ["missing"],
        },
        candidateSummary: {
            type: SchemaType.OBJECT,
            properties: {
                summary: {
                    type: SchemaType.OBJECT,
                    properties: {
                        tr: {
                            type: SchemaType.STRING,
                            description: "Brief summary of the candidate's overall suitability in Turkish.",
                            nullable: false,
                        },
                        en: {
                            type: SchemaType.STRING,
                            description: "Brief summary of the candidate's overall suitability in English.",
                            nullable: false,
                        },
                    },
                    required: ["tr", "en"],
                },
            },
            required: ["summary"],
        },
        improvementSuggestions: {
            type: SchemaType.OBJECT,
            properties: {
                suggestions: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            tr: {
                                type: SchemaType.STRING,
                                description: "Suggestion for improvement in Turkish.",
                                nullable: false,
                            },
                            en: {
                                type: SchemaType.STRING,
                                description: "Suggestion for improvement in English.",
                                nullable: false,
                            },
                        },
                        required: ["tr", "en"],
                    },
                    description: "Suggestions on how the candidate can improve their qualifications or skills.",
                },
            },
            required: ["suggestions"],
        },
    },
    required: [
        "candidateScore",
        "candidateStrengths",
        "candidateMissing",
        "candidateSummary",
        "improvementSuggestions",
    ],
};
