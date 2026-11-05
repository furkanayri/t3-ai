export default async function permissionsOfUser(ctx: Context) {
    const filter: any = {
        userId: ctx.state.user._id,
    }

    const response = await ctx.service("permissions").findAll(filter);

    ctx.body = response
}