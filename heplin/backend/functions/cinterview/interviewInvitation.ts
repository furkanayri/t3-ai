import { ICandidateInterview, ObjectId } from "@/types/entities";
import sendEmail from "@/utils/mail/sendMail";
import moment from "moment";
import { spendAiFeaturesCredit } from "../quotas/utils";

export default async function interviewInvitation(ctx: Context) {

    const { jobId, applicationId, tenantId } = ctx.params
    const { type, interviewId } = ctx.request.body
    const job = await ctx.service("jobs").findOne({ _id: jobId });

    const jobApplication = await ctx
        .service("jobApplications")
        .findOne({ _id: applicationId });

    // TODO check and add 12.02.25
    // if (!job || job.aiInterview === "no" || !job.aiInterview) {
    //     console.log("No AI interview required");
    //     return;
    // }

    const interview = await ctx.service('interview').findById(interviewId)
    const interviewQuestion = await ctx.service('interviewQuestions').findOne({ interviewId: interview._id })
    let questionTimeSum
    if (interviewQuestion && interviewQuestion.questions) {
        questionTimeSum = interviewQuestion.questions.reduce((sum, question) => {
            return sum + (question.duration || 0);
        }, 0);
    }
    const candidateInterviewAnswers = await ctx.service('candidateInterviewAnswers').create({
        userId: jobApplication.userId,
        jobApplicationId: jobApplication._id as ObjectId,
        jobId: job._id as ObjectId,
        interviewId: interview._id as ObjectId,
    })
    const payload: Partial<ICandidateInterview> = {
        name: interview.name,
        totalDuration: questionTimeSum || 0,
        userId: jobApplication.userId,
        jobApplicantId: jobApplication._id as ObjectId,
        candidateId: jobApplication.candidateId,
        jobId: job._id as ObjectId,
        interviewId: interview._id as ObjectId,
        interviewType: type,
        candidateAnswersId: candidateInterviewAnswers._id as ObjectId,

    }
    const candidateInterview = await ctx.service('candidateInterview').create(payload)



    const tenant = await ctx.service("tenants").findOne({
        _id: tenantId,
    });

    const candidate = await ctx.service("candidates").findOne({
        _id: jobApplication.candidateId,
    });
    const createdAt = candidateInterview.createdAt;
    const expirationDate = moment(createdAt).add(3, "days").toDate();
    const expirationDateFormatted =
        moment(expirationDate).format("DD/MM/YYYY HH:mm");


    // burada eğer olmazsa email send false olarak ekle ve try catch e alınsın
    const interviewMail = await sendEmail(
        tenant.senderMailAddress,
        candidate.email,
        "Interview", // video interview
        "interview",
        {
            jobTitle: job.title,
            name: candidate.name,
            expirationDate: expirationDateFormatted,
            link: process.env.WEB_APP_URL + `/interviews/${candidateInterview._id}`,
        }
    )
        .then(async () => {
            console.log("Email sent successfully");
            await ctx.service("candidateInterview").updateOne(
                { _id: candidateInterview._id },
                {
                    mailSent: true,
                    expirationDate: expirationDate,
                }
            );
        })
        .catch((error) => {
            console.error("Error sending email", error);
        });

    const quotaMapper = {
        'text': 'interview',
        'video': 'videoInterview'
    }

    await spendAiFeaturesCredit(ctx, tenantId, quotaMapper[type], 1)

    ctx.body = { isSuccess: true };

}