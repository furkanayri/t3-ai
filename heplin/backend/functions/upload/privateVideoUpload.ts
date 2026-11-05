import { s3Client } from "@/utils";
import slugify from "slugify";
import multer from "@koa/multer";
import { uuid } from "uuidv4";
import { transcribeVideo } from "@/utils/videoInterview";

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
        fileSize: 80 * 1024 * 1024,
    },
});

export default async function privateVideoUpload(ctx: Context) {
    await upload.single("video")(ctx, async () => { });
    const file = ctx.file;

    const { video } = ctx.request.body
    if (video === 'timeout' && !file) {
        ctx.state.transcription = 'Answertimeout';
        ctx.body = { isSuccess: true };
        console.log('çalıştım');
        return
    }

    if (!file) {
        ctx.throw(400, "Dosya yüklenemedi.");
    }

    const transcription = await transcribeVideo(file.buffer, file.originalname, file.mimetype);

    const result = await s3Client.upload({
        Bucket: process.env.AWS_BUCKET_PRIVATE,
        Key: generateFileKey(file.originalname),
        Body: file.buffer,
        ContentType: file.mimetype,
    }).promise();

    ctx.state.fileKey = result.Key;
    ctx.state.transcription = transcription;

    ctx.body = {
        isSuccess: true,
        key: result.Key,
        transcription,
    };
}