
export default async function interviewLogs(ctx: Context) {
    const id = ctx.params.interviewId;
    const { eventType, questionId } = ctx.request.body;
    const interview = await ctx.service('candidateInterview').updateOne({ _id: id }, {
        $push: {
            eventLogs: {
                eventType,
                questionId
            },
        },
    }
    );
    ctx.body = interview
}