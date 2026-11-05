export default async function getMyEmployeeData(ctx: Context) {
    const userId = ctx.state?.user?._id;

    const { tenantId } = ctx.params;

    const employee = await ctx.service("employees").findOne({
        userId,
        tenantId
    })

    ctx.body = { employee }
}