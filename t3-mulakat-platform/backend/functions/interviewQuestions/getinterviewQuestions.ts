
export default async function getInterviewQuestion(ctx: Context) {
    const { tenantId, interviewId } = ctx.params

    const interview = await ctx.service('interviewQuestions').findOne({ tenantId: tenantId, interviewId: interviewId });
    ctx.body = interview
}