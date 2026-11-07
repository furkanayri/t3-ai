
export default async function createInterview(ctx: Context) {
    const { tenantId } = ctx.params

    const interview = await ctx.service('interview').create({ tenantId: tenantId, ...ctx.request.body });
    const interviewQuestion = await ctx.service('interviewQuestions').create({ tenantId: tenantId, interviewId: interview?._id })
    ctx.body = { interview };
}