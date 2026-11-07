import { customSchema } from "./geminiPdfSchema";
import { GeminiChatCompletion } from "./GeminiChatCompletion";

function validate(data: any, schema: any) {
    const errors: string[] = [];

    const validateField = (value: any, fieldSchema: any, path: string) => {
        if (fieldSchema.required && value === undefined) {
            errors.push(`${path} field is required.`);
        }
        if (value !== undefined) {
            // Type check
            if (fieldSchema.type === "string" && typeof value !== "string") {
                errors.push(`${path} must be a string.`);
            } else if (fieldSchema.type === "number" && typeof value !== "number") {
                errors.push(`${path} must be a number.`);
            } else if (fieldSchema.type === "boolean" && typeof value !== "boolean") {
                errors.push(`${path} must be a boolean.`);
            }
            // Enum check
            else if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
                errors.push(`${path} has an invalid enum value.`);
            }
            // Nested object
            else if (fieldSchema.type === "object" && fieldSchema.properties) {
                const nestedValidation = validate(value, fieldSchema.properties);
                if (nestedValidation.errors.length > 0) {
                    nestedValidation.errors.forEach(err => errors.push(`${path}.${err}`));
                }
            }
            // Array check
            else if (fieldSchema.type === "array" && fieldSchema.items) {
                if (!Array.isArray(value)) {
                    errors.push(`${path} must be an array.`);
                } else {
                    value.forEach((item, index) => {
                        const itemValidation = validate({ item }, { item: fieldSchema.items });
                        if (itemValidation.errors.length > 0) {
                            itemValidation.errors.forEach(err =>
                                errors.push(`${path}[${index}].${err}`)
                            );
                        }
                    });
                }
            }
        }
    };

    if (schema.type === "object") {
        for (const key in schema.properties) {
            validateField(data[key], schema.properties[key], key);
        }
    } else if (schema.type === "array") {
        if (!Array.isArray(data)) {
            errors.push(`Main data must be an array.`);
        } else {
            data.forEach((item, index) => {
                const itemValidation = validate(item, schema.items);
                if (itemValidation.errors.length > 0) {
                    itemValidation.errors.forEach(err => errors.push(`[${index}].${err}`));
                }
            });
        }
    }

    return { isValid: errors.length === 0, errors };
}

export default async function geminiPdftoJson(dataBuffer: Buffer) {
    const pdf = require("pdf-parse");

    try {
        const pdfData = await pdf(dataBuffer);

        const prompt =
            `You are given Turkish text with potential spacing and character issues.
             1) Correct the text so that all Turkish words are properly spaced and spelled with correct diacritical marks.
             2) Extract the relevant user/event information from the corrected text.
             3) Output the result strictly as valid JSON matching the predefined schema. 
             4) Use null if certain fields are missing or uncertain.

            Text:
           `;


        const geminiConvertJson = await GeminiChatCompletion(
            prompt,
            pdfData.text,
            customSchema
        );


        const validationResult = validate(geminiConvertJson, customSchema);
        if (!validationResult.isValid) {
            console.error("Validation error:", validationResult.errors);
            throw new Error(
                "Data validation error: " + validationResult.errors.join(", ")
            );
        }

        return geminiConvertJson;

    } catch (err) {
        console.error("Error processing PDF:", err);
        throw err;
    }
}
