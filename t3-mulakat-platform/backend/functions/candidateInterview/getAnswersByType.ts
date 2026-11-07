import { Context } from "koa";

export default async function getAnswersByType(ctx: Context) {
    const { tenantId, candidateId } = ctx.params;
    const { interviewType, page, limit } = ctx.query;

    if (interviewType !== "video" && interviewType !== "text") {
        ctx.throw(400, "interviewType must be video or text");
    }

    const candidate = await ctx.service("candidates").findOne({
        _id: candidateId,
        tenantId,
    });

    if (!candidate) {
        ctx.throw(404, "Candidate not found");
    }

    const interviews = await ctx.service("candidateInterview").findAll(
        {
            candidateId,
            interviewType,
            page: page || 1,
            limit: limit || 1,
            sort: "-createdAt",
        },
        {
            populate: ["candidateAnswersId"],
        }
    );

    ctx.body = interviews;
}
