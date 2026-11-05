import { s3Client } from "@/utils";
import mime from "mime-types"; 

export default async function readVideo(ctx) {
    const { fileKey } = ctx.params;

    if (!fileKey) {
        return ctx.throw(400, "Dosya anahtarı gerekli.");
    }

    try {
        const bucket = process.env.AWS_BUCKET_PRIVATE ?? "";

        const headData = await s3Client.headObject({
            Bucket: bucket,
            Key: fileKey,
        }).promise();

        const fileSize = headData.ContentLength;
        const contentType = headData.ContentType ?? mime.lookup(fileKey) ?? "application/octet-stream";

        const range = ctx.request.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize) {
                ctx.status = 416;
                ctx.set("Content-Range", `bytes */${fileSize}`);
                return;
            }

            const chunkSize = end - start + 1;

            const stream = s3Client.getObject({
                Bucket: bucket,
                Key: fileKey,
                Range: `bytes=${start}-${end}`,
            }).createReadStream();

            stream.on("error", (err) => {
                console.error("🔴 Stream hatası (range):", err);
                if (!ctx.headerSent) ctx.throw(500, "Stream hatası");
                else ctx.res.destroy(); 
            });

            ctx.status = 206;
            ctx.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
            ctx.set("Accept-Ranges", "bytes");
            ctx.set("Content-Length", chunkSize);
            ctx.set("Content-Type", contentType);
            ctx.set("Access-Control-Allow-Credentials", "true");

            ctx.body = stream;
        } else {
            const stream = s3Client.getObject({
                Bucket: bucket,
                Key: fileKey,
            }).createReadStream();

            stream.on("error", (err) => {
                console.error("🔴 Stream hatası (full):", err);
                if (!ctx.headerSent) ctx.throw(500, "Stream hatası");
                else ctx.res.destroy();
            });

            ctx.status = 200;
            ctx.set("Content-Length", fileSize);
            ctx.set("Accept-Ranges", "bytes");
            ctx.set("Content-Type", contentType);
            // ctx.set("Access-Control-Allow-Origin", "http://localhost:5173");
            ctx.set("Access-Control-Allow-Credentials", "true");

            ctx.body = stream;
        }

    } catch (error) {
        console.error("❌ Dosya alınamadı:", error);
        if (error.code === "NotFound" || error.code === "NoSuchKey") {
            return ctx.throw(404, "Dosya bulunamadı.");
        }
        return ctx.throw(500, "Dosya alınamadı.");
    }
}
