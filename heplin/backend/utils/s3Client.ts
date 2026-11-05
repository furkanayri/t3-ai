import AWS from "aws-sdk";

const s3Client = new AWS.S3({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: "auto",
    signatureVersion: 'v4',
    s3ForcePathStyle: false,
    sslEnabled: true,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    httpOptions: {
        timeout: 300000,
        connectTimeout: 10000,
    },
});

export default s3Client;
