export default async function assignToUser(ctx: Context) {
    const { employeeId, } = ctx.request.body
    const { tenantId } = ctx.params

    const onboardingWorkflowId = ctx.params.id

    const workflowId = await ctx.service("onboardingworkflows").findOne({
        _id: onboardingWorkflowId,
        tenantId
    })

    if (!workflowId) return ctx.throw(404, "Not found any workflow");


    const employee = await ctx.service("employees").findOne({
        _id: employeeId,
        tenantId
    })

    if (!employee) return ctx.throw(404, "Not found any employee")

    await ctx.service("employees").updateOne({
        _id: employee._id
    }, {
        onboardingWorkflowId: workflowId,
        isOnboardCompleted: false
    })

    ctx.body = {
        success: true
    }
}