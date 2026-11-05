export default async function createCategory(ctx: Context) {
    const payload = { ...ctx.request.body }
    const categories = await ctx.service('categories').create(
        payload
    );
    ctx.body = { categories };
}