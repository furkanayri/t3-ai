
export default async function createInterviewAutomation(ctx: Context) {
    const { tenantId } = ctx.params

    const interviewAutomation = await ctx.service('interviewAutomation').create(
        { ...ctx.request.body }
    )

    ctx.body = interviewAutomation
}