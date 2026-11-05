export default async function managePermissionsOfUser(ctx: Context) {
    const tenantId = ctx.params.tenantId;
    const memberId = ctx.params.memberId;

    const tenantMember = await ctx.service("tenantMembers").findOne({
        _id: memberId,
        tenantId,
    })

    if (!tenantMember) ctx.throw(404, "Member not found")

    const { permissions } = ctx.request.body;

    if (!Array.isArray(permissions)) throw new Error("Data must be an array");

    await Promise.all((permissions).map((permission: any) => {
        return ctx.service("permissions").updateOne({
            userId: tenantMember.userId,
            scope: permission.scope,
        }, {
            $addToSet: {
                "resource.tenantId": tenantId,
            },
            allowed: !!permission.allowed
        }, {
            upsert: true,
            new: true
        })
    }))

    ctx.body = true;
}