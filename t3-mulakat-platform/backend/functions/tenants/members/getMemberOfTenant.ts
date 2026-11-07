export default async function getMemberOfTenant(ctx: Context) {
    const { tenantId, memberId } = ctx.params

    const response = await ctx.service("tenantMembers").findOne({
        _id: memberId,
        tenantId,
    })

    ctx.body = {
        isSuccess: true,
        member: response,
    }
}