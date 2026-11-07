export default async function findAll(ctx: Context) {
    ctx.request.body.tenantId = ctx.params.tenantId;

    const onboardingworkflow = await ctx.service('onboardingworkflows').create(ctx.request.body);
    ctx.body = { onboardingworkflow };
}