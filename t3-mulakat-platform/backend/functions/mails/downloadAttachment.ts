import { S3 } from "aws-sdk"

const s3Client = new S3({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,

    },
    region: process.env.AWS_S3_REGION
})

export default async function downloadAttachment(ctx: Context) {
    const tenant = ctx.state.tenant;

    if (!tenant?.senderMailAddress) {
        ctx.throw(
            400,
            "Mailbox configuration does not found. Please configure your mailbox."
        );
    }
    const { mailId } = ctx.params

    const fileKey = ctx.query.filekey?.toString()

    if (!fileKey) return ctx.throw(400, "File key is required");

    if (!mailId) return ctx.throw(400, "Mail id is required");

    const query = {
        $or: [
            { "from.address": tenant?.senderMailAddress },
            { "to.address": tenant?.senderMailAddress },
            { "cc.address": tenant?.senderMailAddress },
        ],
        "attachments.filekey": fileKey,
    }

    const mail = await ctx.service("mails").findOne(query)

    if (!mail) return ctx.throw(404, "Mail not found");

    const fileName = mail.attachments.find((attachment: any) => attachment.filekey === fileKey)?.filename;

    const options = {
        Bucket: process.env.AWS_S3_BUCKET_NAME ?? "",
        Key: fileKey
    };

    console.log({ fileKey })

    ctx.attachment(fileName);

    const fileStream = s3Client
        .getObject(options)
        .createReadStream()
        .on("error", (error: any) => {
            return ctx.throw(400, error?.message);
        });

    ctx.body = fileStream;
}