import nodemailer from "nodemailer";
import pug from "pug"
import path from "path"
import awsSESClient from "../sesClient"
import Handlebars from "handlebars";
import { IRecruitmentEmailConfig } from "@/types/entities";

// Create Nodemailer transporter using AWS SES
const transporter = nodemailer.createTransport({
    SES: awsSESClient,
})

type EmailTemplateType = "invitation-meeting" | "disqualified" | "templated" | "invitation-account" | "forgot-password" | "onboarding" | "re-onboarding" | "hire" | "inviteAnotherJob" | "interview" | "verification-code" | "bulkInterviewInvitation";

type EmailTemplatePathMapper = {
    [key in EmailTemplateType]: string;
};

const EmailTemplatePathMapper: EmailTemplatePathMapper = {
    "invitation-meeting": "invitation-meeting.pug",
    "invitation-account": "invitation-account.pug",
    "disqualified": "disqualified.pug",
    "onboarding": 'onboarding.pug',
    "re-onboarding": 'reonboarding.pug',
    "hire": "hire.pug",
    "templated": "templated.pug",
    "forgot-password": "forgot-password.pug",
    "inviteAnotherJob": "inviteAnotherJob.pug",
    "interview": "interview.pug",
    "verification-code": "verification-code.pug",
    "bulkInterviewInvitation": "bulk-interview-invitation.pug"
}

export async function sendEmailPlain(sender: string, recipientEmail: string, subject: string, text: string) {
    const mailOptions = {
        from: `Heplin <${sender}>`,
        to: recipientEmail,
        subject,
        text,
    }

    await transporter.sendMail(mailOptions)

    return {
        isSuccess: true
    }
}

const sendEmail = async (sender, recipientEmail: string, subject: string, template: EmailTemplateType, payload: any) => {
    // console.log('no-reply@applin.io', DEFAULT_SENDER_MAIL);

    const mailViewPath = EmailTemplatePathMapper[template]
    const compiledFunction = pug.compileFile(path.join(__dirname, "views", mailViewPath));
    const mailOptions = {
        from: `Heplin <${sender}>`,
        to: recipientEmail,
        subject,
        html: compiledFunction(payload),
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error(error)
    }
}

export default sendEmail;

export const sendTemplatedEmail = async ({ config, context, recipientEmail, sender }: { config: IRecruitmentEmailConfig, context: any, recipientEmail: string, sender: string }) => {
    if (!recipientEmail) return

    const template = Handlebars.compile(config.content)
    const result = template(context)


    await sendEmail(sender, recipientEmail, "About your application", "templated", {
        title: "Job Application Update",
        content: result
    })

}

export const sendDisqualifiedEmail = async ({ sender, email, jobTitle, customMailContent }: { sender: string, email: string, jobTitle: string, customMailContent: any }) => {
    if (process.env.NODE_ENV === "development") {
        console.log(
            JSON.stringify(
                {
                    email,
                },
                null,
                2
            )
        );
    }

    const content = customMailContent !== undefined ? customMailContent : null;
    await sendEmail(sender, email, "About your application", "disqualified", { jobTitle, customMailContent: content })

    return {
        isSuccess: true
    }
}