import { SchemaType } from "@google/generative-ai";
export const geminiPersonalityEvaluationSchema = {
    description: "Gemini personality evaluation schema",
    type: SchemaType.OBJECT,
    properties: {
        perfectionism: {
            type: SchemaType.OBJECT,
            properties: {
                score: {
                    type: SchemaType.NUMBER,
                    description: "1 ile 10 arasında bir puan",
                    minimum: 1,
                    maximum: 10,
                    nullable: false,
                },
            },
            required: ["score"],
        },
        ambition: {
            type: SchemaType.OBJECT,
            properties: {
                score: {
                    type: SchemaType.NUMBER,
                    description: "1 ile 10 arasında bir puan",
                    minimum: 1,
                    maximum: 10,
                    nullable: false,
                },
            },
            required: ["score"],
        },
        motivation: {
            type: SchemaType.OBJECT,
            properties: {
                score: {
                    type: SchemaType.NUMBER,
                    description: "1 ile 10 arasında bir puan",
                    minimum: 1,
                    maximum: 10,
                    nullable: false,
                },
            },
            required: ["score"],
        },
        desireForLeadership: {
            type: SchemaType.OBJECT,
            properties: {
                score: {
                    type: SchemaType.NUMBER,
                    description: "1 ile 10 arasında bir puan",
                    minimum: 1,
                    maximum: 10,
                    nullable: false,
                },
            },
            required: ["score"],
        },
        strengths: {
            type: SchemaType.OBJECT,
            properties: {
                tr: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                    description: "Güçlü yönlerin Türkçe listesi",
                    nullable: false,
                },
                en: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                    description: "Güçlü yönlerin İngilizce listesi",
                    nullable: false,
                },
            },
            required: ["tr", "en"],
        },
        weaknesses: {
            type: SchemaType.OBJECT,
            properties: {
                tr: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                    description: "Zayıf yönlerin Türkçe listesi",
                    nullable: false,
                },
                en: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                    description: "Zayıf yönlerin İngilizce listesi",
                    nullable: false,
                },
            },
            required: ["tr", "en"],
        },
    },
    required: ["perfectionism", "ambition", "motivation", "desireForLeadership", "strengths", "weaknesses"],
};
