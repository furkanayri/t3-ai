
export default async function update(ctx: Context) {
    const { id, tenantId } = ctx.params;
    /*
    delete ctx.request.body.createdBy
    delete ctx.request.body.deletedBy
    delete ctx.request.body.deletedAt
    delete ctx.request.body.updatedBy
    delete ctx.request.body.updatedAt
    */

    const onboardingResponse = await ctx.service('onboardingresponses').updateOne({
        _id: id,
        tenantId,
    }, ctx.request.body);
    ctx.body = { onboardingResponse };
}