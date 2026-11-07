import { SchemaType } from "@google/generative-ai";

export const geminiJobContentSchema = {
    description: "Job content schema",
    type: SchemaType.OBJECT,
    properties: {
        description: {
            type: SchemaType.STRING,
            description: "Job description",
            nullable: false,
        },
    },
    required: ["description"],
};