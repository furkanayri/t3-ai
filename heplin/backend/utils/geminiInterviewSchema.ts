import { SchemaType } from "@google/generative-ai";
export const interviewSchema = {
    description: "List of interview questions",
    type: SchemaType.OBJECT,
    properties: {
        questions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: {
                        type: SchemaType.STRING,
                        description: "The interview question",
                        nullable: false,
                    },
                    duration: {
                        type: SchemaType.INTEGER,
                        description: "Duration of the question in minutes",
                        nullable: false,
                    },
                },
                required: ["question", "duration"],
            },
        },
    },
    required: ["questions"],
};

export const geminiAnswerSchema = {
    description: "Schema for Gemini interview evaluation response",
    type: SchemaType.OBJECT,
    properties: {
        interviewEvaluate: {
            type: SchemaType.STRING,
            description: "Interview evaluation summary",
            nullable: false,
        },
    },
    required: ["interviewEvaluate"],
};

export const geminiEvaluaterAnswerSchema = {
    description: "Detailed schema for Gemini evaluator responses",
    type: SchemaType.OBJECT,
    properties: {
        interviewEvaluate: {
            type: SchemaType.OBJECT,
            properties: {
                evaluation: {
                    type: SchemaType.OBJECT,
                    properties: {
                        tr: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    evaluation: {
                                        type: SchemaType.STRING,
                                        description: "Evaluation in Turkish",
                                        nullable: false,
                                    },
                                    score: {
                                        type: SchemaType.NUMBER,
                                        description: "Score for the evaluation",
                                        nullable: false,
                                    },
                                    questionId: {
                                        type: SchemaType.STRING,
                                        description: "ID of the question being evaluated",
                                        nullable: false,
                                    },
                                },
                                required: ["evaluation", "score", "questionId"],
                            },
                        },
                        en: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    evaluation: {
                                        type: SchemaType.STRING,
                                        description: "Evaluation in English",
                                        nullable: false,
                                    },
                                    score: {
                                        type: SchemaType.NUMBER,
                                        description: "Score for the evaluation",
                                        nullable: false,
                                    },
                                    questionId: {
                                        type: SchemaType.STRING,
                                        description: "ID of the question being evaluated",
                                        nullable: false,
                                    },
                                },
                                required: ["evaluation", "score", "questionId"],
                            },
                        },
                    },
                    required: ["tr", "en"],
                },
                totalScore: {
                    type: SchemaType.NUMBER,
                    description: "Total interview score",
                    nullable: false,
                },
                generalEvaluation: {
                    type: SchemaType.OBJECT,
                    properties: {
                        tr: {
                            type: SchemaType.STRING,
                            description: "General evaluation in Turkish",
                            nullable: false,
                        },
                        en: {
                            type: SchemaType.STRING,
                            description: "General evaluation in English",
                            nullable: false,
                        },
                    },
                    required: ["tr", "en"],
                },
            },
            required: ["evaluation", "totalScore", "generalEvaluation"],
        },
    },
    required: ["interviewEvaluate"],
};
