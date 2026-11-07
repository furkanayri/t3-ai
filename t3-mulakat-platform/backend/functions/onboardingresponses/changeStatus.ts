export default async function changeStatus(ctx: Context) {
    const { id, tenantId } = ctx.params;

    const { status } = ctx.request.body;

    if (!status) return ctx.throw(400, "Status field is required!");

    const onboardingResponse = await ctx.service("onboardingresponses").findOne({
        _id: id,
    });

    if (!onboardingResponse) {
        return ctx.throw(404, "Not found response")
    }

    await ctx.service("onboardingresponses").updateOne(
        {
            _id: id,
            tenantId,
        },
        ctx.request.body
    );

    if (status === "accepted") {
        await ctx.service("employees").updateOne(
            {
                _id: onboardingResponse?.employeeId,
            },
            {
                isOnboardCompleted: true,
                onboardingWorkflowId: onboardingResponse?.onboardingWorkflowId
            }
        );
    }

    ctx.body = { success: true };
}
