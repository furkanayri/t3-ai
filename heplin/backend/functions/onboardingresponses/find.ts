export default async function get(ctx: Context) {
    const { id } = ctx.params;
    const query = {
        _id: id,
        isDeleted: { $ne: true },
        tenantId: ctx.params.tenantId,
    };
    const onboardingResponse = await ctx.service('onboardingresponses').findOne(query, {
        populate: ["employeeId"]
    });
    ctx.body = { onboardingResponse };
}