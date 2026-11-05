import { s3Client } from "@/utils";
import streamToBuffer from 'stream-to-buffer';
export default async function readFile(ctx: Context) {
    const { fileKey } = ctx.params

    if (!fileKey) return ctx.throw(400, "File key is required");

    const options = {
        Bucket: process.env.AWS_BUCKET_PRIVATE ?? "",
        Key: fileKey
    };

    ctx.attachment(fileKey);

    const fileStream = s3Client
        .getObject(options)
        .createReadStream()
        .on("error", (error: any) => {
            return ctx.throw(500, error?.message);
        });
    ctx.state.fileBuffer = await new Promise((resolve, reject) => {
        streamToBuffer(fileStream, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });

    ctx.body = fileStream;
}