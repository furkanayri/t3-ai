import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;


export async function GeminiChatCompletion(
    prompt: string,
    text: string,
    schema: any,
    temperature = 0
): Promise<any> {

    const genAI = new GoogleGenerativeAI(API_KEY);


    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash", generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        const fullPrompt = `
    ${prompt} Text:${text}
    `;


        const result = await model.generateContent(fullPrompt);
        const response = result.response;

        let jsonString = await response.text();
        jsonString = JSON.parse(jsonString);

        return jsonString

    } catch (error) {
        console.error("Gemini API error:", error);
        throw error;
    }
}
