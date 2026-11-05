export default async function get(ctx: Context) {
    const { id } = ctx.params;
    const query = {
        _id: id,
        isDeleted: { $ne: true },
        tenantId: ctx.params.tenantId,
    };
    const onboardingworkflow = await ctx.service('onboardingworkflows').findOne(query);
    ctx.body = { onboardingworkflow };
}