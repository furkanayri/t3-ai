import { s3Client } from "@/utils";
import { uuid } from "uuidv4";
import slugify from "slugify";

const generateFileKey = (fileName: string) => {
    return uuid() + "-" + slugify(fileName, {
        lower: true,
        trim: true,
        remove: /[*+~()'"!:@]/g,
    });
};


export default async function generatePresignedUrl(ctx: Context) {
    const { fileName, contentType, questionId } = ctx.request.body;

    if (!fileName || !contentType) {
        ctx.throw(400, "fileName and contentType are required");
    }

    const fileKey = generateFileKey(`${questionId}-${fileName}`);

    if (process.env.LOCAL_UPLOAD_DIR) {
        const baseUrl = process.env.URL || `http://localhost:${process.env.PORT || 3000}`;
        ctx.body = {
            isSuccess: true,
            presignedUrl: `${baseUrl}/api/v1/upload/local/${encodeURIComponent(fileKey)}`,
            fileKey,
            contentType,
            expiresIn: 600,
        };
        return;
    }

    const presignedUrl = await s3Client.getSignedUrlPromise("putObject", {
        Bucket: process.env.AWS_BUCKET_PRIVATE,
        Key: fileKey,
        Expires: 600,
    });


    ctx.body = {
        isSuccess: true,
        presignedUrl,
        fileKey,
        contentType,
        expiresIn: 600,
    };
}
