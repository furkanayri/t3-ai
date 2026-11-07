import { s3Client } from "@/utils";
import { transcribeVideo } from "@/utils/videoInterview";


export default async function transcribeVideoFromR2(ctx: Context) {
    const { fileKey, fileName } = ctx.request.body;

    if (!fileKey) {
        ctx.throw(400, "fileKey is required");
    }

    try {
        const s3Object = await s3Client.getObject({
            Bucket: process.env.AWS_BUCKET_PRIVATE,
            Key: fileKey,
        }).promise();

        if (!s3Object.Body) {
            ctx.throw(404, "Video not found in storage");
        }

        const videoBuffer = Buffer.from(s3Object.Body as Buffer);

        const transcription = await transcribeVideo(
            videoBuffer,
            fileName || "video.webm",
            s3Object.ContentType || "video/webm"
        );

        ctx.body = {
            isSuccess: true,
            transcription,
            fileKey,
        };
    } catch (error) {
        console.error("Transcription failed:", error);
        ctx.throw(500, `Transcription failed: ${error.message}`);
    }
}
