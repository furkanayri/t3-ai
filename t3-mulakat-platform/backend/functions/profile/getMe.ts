export default async function getMe(ctx: Context) {
    const user = ctx.state.user;
    if (!user) throw new Error("User not found")

    ctx.status = 200;

    const tenantMember = await ctx.service('tenantMembers').findOne({
        userId: user._id,
    })

    const tenant = await ctx.service('tenants').findOne({
        _id: tenantMember?.tenantId,
    })

    const permissionsRes = await ctx.service('permissions').findAll({
        userId: user._id,
    })

    const employee = await ctx.service('employees').findOne({
        userId: user._id
    })

    ctx.body = {
        user,
        tenant,
        permissions: permissionsRes?.results,
        token: ctx.state?.token,
        employee: employee
    };
}