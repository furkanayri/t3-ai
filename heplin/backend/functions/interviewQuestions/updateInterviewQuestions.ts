
export default async function updateInterviewQuestions(ctx: Context) {
    const { tenantId, interviewId } = ctx.params


    const interview = await ctx.service('interviewQuestions').updateOne({
        interviewId,
        tenantId
    }, { ...ctx.request.body });
    ctx.body = { interview };
}