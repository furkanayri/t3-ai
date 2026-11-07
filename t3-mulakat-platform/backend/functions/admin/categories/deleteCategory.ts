export default async function deleteCategory(ctx: Context) {
    const { categoryId } = ctx.params;
    const { user } = ctx.state;

    const categories = await ctx.service('categories').softDelete({
        _id: categoryId,
    }, user?._id);
    ctx.body = { categories };
}