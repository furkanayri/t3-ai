import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import openaiTokenCounter from 'openai-gpt-token-counter';
// autoFillCompletion
export async function GptChatCompletion(system, user, response_format, temperature = 0) {
    const openai = new OpenAI({
        apiKey: process.env.OPEN_AI,
    });
    const messages = [
        { role: "system", content: system },
        { role: "user", content: user },
    ];
    const tokenCount = openaiTokenCounter.chat(messages, 'gpt-4');

    console.log(`openai-gpt-token-counter input Token : ${tokenCount}`);

    const chatCompletion = await openai.beta.chat.completions.parse({
        messages: [
            { role: 'system', content: system },
            {
                role: "user", content: user
            }
        ],
        temperature: temperature,
        model: 'gpt-4o-mini',
        response_format: zodResponseFormat(response_format, 'event')
    });
    console.log(`output Token : ${tokenCount}`);

    return chatCompletion.choices[0].message.parsed
}

