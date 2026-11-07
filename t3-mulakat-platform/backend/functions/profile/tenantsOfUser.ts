export default async function tenantsOfUser(ctx: Context) {
    const response = await ctx.service("tenantMembers").findAll({
        userId: ctx.state.user._id,
    })

    const query = {
        _id: {
            $in: response.results.map((item: any) => item.tenantId)
        }
    }

    const tenants = await ctx.service("tenants").findAll(query)

    ctx.body = tenants;
}