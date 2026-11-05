export default async function getMemberPermissions(ctx: Context) {
    const tenantId = ctx.params.tenantId;
    const memberId = ctx.params.memberId;

    const tenantMember = await ctx.service("tenantMembers").findOne({
        _id: memberId,
        tenantId,
    })

    if (!tenantMember) ctx.throw(404, "Member not found")

    const permissions = await ctx.service("permissions").findAll({
        userId: tenantMember.userId,
        "resource.tenantId": tenantId,
        allowed: true,
    })

    ctx.body = permissions
}