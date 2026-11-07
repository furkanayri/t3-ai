export default async function update(ctx: Context) {
    const res = await ctx.service('emailTemplates').updateOne({
        _id: ctx.params.id,
        tenantId: ctx.params.tenantId
    }, ctx.request.body
    )

    ctx.body = {
        res
    }
}