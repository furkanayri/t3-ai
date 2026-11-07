import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const LOCAL_UPLOAD_PREFIX = "/api/v1/upload/local/";

function resolveUploadTarget(fileKey: string) {
    const uploadDir = process.env.LOCAL_UPLOAD_DIR;
    if (!uploadDir) {
        return null;
    }

    const decodedKey = decodeURIComponent(fileKey);
    if (!decodedKey || path.basename(decodedKey) !== decodedKey) {
        return null;
    }

    const root = path.resolve(uploadDir);
    const target = path.resolve(root, decodedKey);
    if (!target.startsWith(`${root}${path.sep}`)) {
        return null;
    }

    return { root, target };
}

export async function localUpload(ctx: Context, next: Next) {
    if (!process.env.LOCAL_UPLOAD_DIR || !ctx.path.startsWith(LOCAL_UPLOAD_PREFIX)) {
        return next();
    }

    const fileKey = ctx.path.slice(LOCAL_UPLOAD_PREFIX.length);
    const uploadTarget = resolveUploadTarget(fileKey);
    if (!uploadTarget) {
        ctx.throw(400, "Invalid local upload key");
    }

    await mkdir(uploadTarget.root, { recursive: true });
    ctx.set("Cross-Origin-Resource-Policy", "cross-origin");

    if (ctx.method === "PUT") {
        await pipeline(ctx.req, createWriteStream(uploadTarget.target));
        ctx.status = 204;
        return;
    }

    if (ctx.method === "GET") {
        const fileStats = await stat(uploadTarget.target);
        ctx.type = path.extname(uploadTarget.target) || "application/octet-stream";
        ctx.length = fileStats.size;
        ctx.body = createReadStream(uploadTarget.target);
        return;
    }

    ctx.status = 405;
}
