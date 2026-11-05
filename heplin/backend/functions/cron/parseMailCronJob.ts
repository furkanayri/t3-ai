export default async function parseMailCronJob(ctx: Context) {
    const { S3 } = require("aws-sdk");
    const { simpleParser } = require("mailparser");
    const { MongoClient } = require("mongodb");
    const { uuid } = require('uuidv4');
    const s3 = new S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        region: process.env.AWS_S3_REGION
    });

    const connectToMongoDB = async () => {
        const uri = process.env.MONGO_URI;
        const client = new MongoClient(uri);
        await client.connect();
        return client;
    };

    const generateThreadId = () => {
        return uuid();
    };

    const run = async () => {
        console.time("duration");
        console.log("Script started.");

        const listObjects = await s3.listObjectsV2({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: "mails/"
        }).promise();

        const client = await connectToMongoDB();
        const db = client.db(process.env.MONGO_DB_NAME);
        const collection = db.collection("mails");

        const promise = listObjects.Contents.map(async (object) => {
            const data = await s3.getObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: object.Key,
            }).promise();

            const mail = await simpleParser(data.Body);

            if (!mail.from || !mail.to) {
                return console.log("Reported: mail is not valid. Skipping...");
            }

            const attachments = Array.isArray(mail.attachments) ? mail.attachments.map(att => {
                return {
                    filekey: "attachments/" + uuid() + "-" + att.filename,
                    filename: att.filename,
                    size: att.size,
                    content: att.content
                };
            }) : [];

            const attachmentPromises = attachments.map(async (attachment) => {
                return s3.putObject({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: attachment.filekey,
                    Body: attachment.content,
                }).promise();
            });

            const attachmentResults = await Promise.allSettled(attachmentPromises);

            const hasAnyError = attachmentResults.some((result) => {
                return result.status === "rejected";
            });

            if (hasAnyError) {
                throw new Error("Error while uploading attachments");
            }

            const isExistMailInMongo = await collection.findOne({
                parsedFromS3Key: object.Key,
                to: { $in: mail.from.value?.map(to => to.address) },
            });

            const isExistThreadId = await collection.findOne({
                "to.address": { $in: mail.from.value?.map(from => from.address) }
            });

            console.log("aradığım veri " + isExistThreadId);

            let threadId;

            if (isExistMailInMongo) {
                console.log("The record: " + isExistMailInMongo._id);
                console.log("Reported: mail is already exist in MongoDB. Skipping...");
            } else {
                if (isExistThreadId) {
                    threadId = isExistThreadId.threadId;
                } else {
                    threadId = generateThreadId();
                }
            }

            // Insert to MongoDB
            await collection.insertOne({
                parsedFromS3Key: object.Key,
                parsedDate: new Date(),
                date: mail.date,
                from: {
                    name: mail.from.value?.[0]?.name,
                    address: mail.from.value?.[0]?.address,
                    text: mail.from.text
                },
                to: mail.to.value?.map(to => ({
                    name: to?.name,
                    address: to?.address
                })),
                cc: mail.cc ? mail.cc?.value?.map(cc => {
                    return {
                        name: cc?.name,
                        address: cc?.address,
                    };
                }) : null,
                bcc: mail.bcc ? mail.bcc?.value?.map(bcc => {
                    return {
                        name: bcc?.name,
                        address: bcc?.address,
                    };
                }) : null,
                subject: mail.subject,
                text: mail.text,
                html: mail.html,
                attachments: attachments.map((attachment) => {
                    return {
                        filekey: attachment.filekey,
                        filename: attachment.filename,
                        size: attachment.size,
                    };
                }),
                isDeleted: false,
                isSeen: false,
                isArchived: false,
                threadId: threadId
            });

            await s3.deleteObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: object.Key
            }).promise();
        });

        const results = await Promise.allSettled(promise);

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error("Error while processing mail: " + listObjects.Contents[index].Key);
                console.error(result.reason);
            }
        });

        await client.close();
        console.log("Parsing completed.");
        console.timeEnd("duration");
    };

    try {
        await run();
        ctx.body = { success: true, message: "Mail parsing completed successfully" };
    } catch (error) {
        console.error("Error in parseMailCronJob:", error);
        ctx.status = 500;
        return { success: false, message: "Mail parsing failed", error: error.message };
    }
}
