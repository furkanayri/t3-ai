export default async function getTenantofInterviewAnswer(ctx: Context) {
    const { interviewAnswerId, applicantId } = ctx.params;

    const interviewAnswer = await ctx.service('interviewAnswers').findAll({ aiInterviewId: interviewAnswerId, jobAppicantId: applicantId },
        {
            populate: [
                {
                    path: "interviewChatId",
                    select: "interiewChat"
                }
            ]
        })

    ctx.body = interviewAnswer;
}
