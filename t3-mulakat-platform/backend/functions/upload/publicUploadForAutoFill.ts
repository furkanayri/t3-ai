import { s3Client } from "@/utils";
import slugify from "slugify";
import multer from "@koa/multer";
import { v4 as uuid } from "uuid";

// Key üretme fonksiyonu
const generateFileKey = (fileName: string) => {
    return uuid() + "-" + slugify(fileName, {
        lower: true,
        trim: true,
        remove: /[*+~()'"!:@]/g,
    });
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit
    },
});

export default async function publicUploadForAutoFill(ctx: any) {
    await upload.single("file")(ctx, async () => { });
    const file = ctx.file;

    const result = await s3Client
        .upload({
            Bucket: process.env.AWS_BUCKET_PRIVATE,
            Key: generateFileKey(file.originalname),
            Body: file.buffer,
            ContentType: file.mimetype,
        })
        .promise();

    ctx.state.fileKey = result.Key;
    ctx.state.fileBuffer = file.buffer;

}
