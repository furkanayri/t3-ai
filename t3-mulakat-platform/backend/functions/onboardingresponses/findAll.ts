export default async function findAll(ctx: Context) {
    const query: any = {
        isDeleted: { $ne: true },
        tenantId: ctx.params.tenantId,
    };
    if (ctx.query.onboardingWorkflowId) {
        query.onboardingWorkflowId = ctx.query.onboardingWorkflowId
    }
    const onboardingResponses = await ctx.service('onboardingresponses').findAll(query, {
        populate: ["employeeId"]
    });
    ctx.body = onboardingResponses
}