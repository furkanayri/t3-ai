export default async function deleteMail(ctx: Context) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const result = await ctx.service('mails').softDelete({
        _id: id,
    }, user?._id);
    ctx.body = { result };
}