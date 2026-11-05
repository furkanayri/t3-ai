import aws from "aws-sdk";

aws.config.update({
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    region: process.env.AWS_SES_REGION,
})

const awsSESClient = new aws.SES({ apiVersion: '2010-12-01' })

export default awsSESClient;