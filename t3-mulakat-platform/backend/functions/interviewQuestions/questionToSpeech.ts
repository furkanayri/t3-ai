import OpenAI from "openai";
import { generateFileKey } from "../upload/publicUpload";
import { s3Client } from "@/utils";

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI,
});

export default async function questionToSpeech(ctx: Context) {
    const { tenantId, interviewId, questionId } = ctx.params;

    try {

        const interview = await ctx.service('interviewQuestions').findOne({ tenantId, interviewId });
        if (!interview || !interview.questions) {
            ctx.throw(404, "Interview or questions not found");
        }


        const question = interview.questions.find(item => item._id.toString() === questionId);
        if (!question) {
            ctx.throw(404, `Question with ID ${questionId} not found`);
        }


        const buffer = await textToSpeech(question.question);


        const fileKey = generateFileKey(question?._id.toString())

        const result = await s3Client
            .upload({
                Bucket: process.env.AWS_BUCKET_PUBLIC,
                Key: `${fileKey}.mp3`,
                Body: buffer,
                ContentType: "audio/mpeg",
            })
            .promise();



        const questionUpdate = await ctx.service("interviewQuestions").updateOne(
            {
                tenantId,
                interviewId,
                "questions._id": questionId,
            },
            {
                $set: {
                    "questions.$.audioKey": result.Key
                },
            }

        );

        ctx.body = questionUpdate
    } catch (error) {
        console.error("Error in getAudioQuestionId:", error.message);
        ctx.throw(500, "Failed to process question");
    }
}

const textToSpeech = async (prompt) => {
    if (!prompt) {
        throw new Error("Text input is missing");
    }

    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: prompt,
        });
        return Buffer.from(await mp3.arrayBuffer());
    } catch (error) {
        console.error("Error in textToSpeech:", error.message);
        throw new Error("Failed to generate audio");
    }
};
