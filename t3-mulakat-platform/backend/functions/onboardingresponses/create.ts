export default async function create(ctx: Context) {
    ctx.request.body.tenantId = ctx.params.tenantId;

    const onboardingResponse = await ctx.service('onboardingresponses').create(ctx.request.body);
    ctx.body = { onboardingResponse };
}