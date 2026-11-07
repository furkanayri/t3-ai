import { Context } from 'koa';

interface InterviewQuery {
    jobId: string;
    jobApplicantId: string;
    interviewType: string | string[];
}

export default async function getTenantInterviewanswers(ctx: Context) {
    const jobId = ctx.params.jobId;
    const jobApplicationId = ctx.params.jobApplicationId;
    const interviewType = ctx.query.interviewType;
    const { page, limit } = ctx.query;


    if (!interviewType) {
        ctx.status = 400;
        ctx.body = { error: "interviewType is required" };
        return;
    }

    const query: InterviewQuery = {
        jobId: jobId,
        jobApplicantId: jobApplicationId,
        interviewType: interviewType,
    };
    // drawer olduğu için tek e düşürdüm
    const pagination = {
        page: page || 1,
        limit: limit || 1,
        sort: "-createdAt",
    };


    try {
        const interview = await ctx.service('candidateInterview').findAll(
            {
                ...query,
                ...pagination
            },
            {
                populate: [
                    'candidateAnswersId',
                    'userId interiewAnswers jobId'
                ]
            }
        );
        ctx.body = interview;
    } catch (error) {
        console.error("Error fetching interviews:", error);
        ctx.status = 500;
        ctx.body = { error: "Error fetching interviews" };
    }
}