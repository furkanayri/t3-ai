export default async function getOne(ctx: Context) {
    const res = await ctx.service('emailTemplates').findById(ctx.params.id);
    ctx.body = res
}