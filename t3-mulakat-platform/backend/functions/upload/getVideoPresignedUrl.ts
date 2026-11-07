import { s3Client } from "@/utils";
import { stat } from "node:fs/promises";
import path from "node:path";

export default async function getVideoPresignedUrl(ctx: Context) {
    const { fileKey } = ctx.params;

    if (!fileKey) {
        ctx.throw(400, "fileKey is required");
    }

    if (process.env.LOCAL_UPLOAD_DIR) {
        const decodedKey = decodeURIComponent(fileKey);
        if (!decodedKey || path.basename(decodedKey) !== decodedKey) {
            ctx.throw(400, "Invalid local video key");
        }
        const root = path.resolve(process.env.LOCAL_UPLOAD_DIR);
        const target = path.resolve(root, decodedKey);
        if (!target.startsWith(`${root}${path.sep}`)) {
            ctx.throw(400, "Invalid local video key");
        }
        try {
            const fileStats = await stat(target);
            if (!fileStats.isFile()) ctx.throw(404, "Video not found in local storage");
        } catch (error: any) {
            if (error?.status === 404) throw error;
            if (error?.code === "ENOENT") ctx.throw(404, "Video not found in local storage");
            throw error;
        }
        const baseUrl = process.env.URL || `http://localhost:${process.env.PORT || 3000}`;
        ctx.body = {
            isSuccess: true,
            presignedUrl: `${baseUrl}/api/v1/upload/local/${encodeURIComponent(fileKey)}`,
            fileKey,
            expiresIn: 900,
        };
        return;
    }

    try {
        const presignedUrl = await s3Client.getSignedUrlPromise("getObject", {
            Bucket: process.env.AWS_BUCKET_PRIVATE,
            Key: fileKey,
            Expires: 900,
        });

        ctx.body = {
            isSuccess: true,
            presignedUrl,
            fileKey,
            expiresIn: 900,
        };
    } catch (error) {
        console.error("Error generating presigned URL:", error);

        if (error.code === "NoSuchKey" || error.code === "NotFound") {
            ctx.throw(404, "Video not found");
        }

        ctx.throw(500, "Failed to generate presigned URL");
    }
}
