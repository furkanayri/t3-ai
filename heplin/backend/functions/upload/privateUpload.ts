import { s3Client } from "@/utils";
import slugify from "slugify";
import multer from "@koa/multer";
import { uuid } from "uuidv4";
import pdftoJson from "@/utils/pdftoJson";

const generateFileKey = (fileName: string) => {
    return uuid() + "-" + slugify(fileName, {
        lower: true,
        trim: true,
        remove: /[*+~()'"!:@]/g,
    });
}
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // limit file size to 15MB
    },
});
export default async function privateUpload(ctx: Context,) {
    console.log(ctx.file, 'ctx.file');
    console.log('verify upload');
    await upload.single("file")(ctx, async () => { })
    const file = ctx.file;


    const result = await s3Client.upload({
        Bucket: process.env.AWS_BUCKET_PRIVATE,
        Key: generateFileKey(file.originalname),
        Body: file.buffer,
        ContentType: file.mimetype,
    }).promise();
    console.log(result, 'result');

    ctx.state.fileKey = result.Key;
    ctx.body = {
        isSuccess: true,
        key: result.Key,
    };
}