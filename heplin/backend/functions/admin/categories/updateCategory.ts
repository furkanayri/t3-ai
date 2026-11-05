export default async function updateCategory(ctx: Context) {
    const { categoryId } = ctx.params;

    const categories = await ctx.service('categories').updateOne({ _id: categoryId }, {
        name: ctx.request.body.name,
        description: ctx.request.body.description,
        status: ctx.request.body.status,
    });

    ctx.body = { categories };
}