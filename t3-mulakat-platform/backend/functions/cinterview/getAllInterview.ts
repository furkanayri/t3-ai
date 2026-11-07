
export default async function getAllInterview(ctx: Context) {
    const { tenantId } = ctx.params
    const interview = await ctx.service('interview').findAll({ tenantId });
    ctx.body = interview
}