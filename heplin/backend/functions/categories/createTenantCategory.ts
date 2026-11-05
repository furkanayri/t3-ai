import slugify from "@/utils/slugify"

export default async function createTenantCategory(ctx: Context) {
    const payload = { ...ctx.request.body }
    const categories = await ctx.service('categories').create(payload);
    ctx.body = { categories };
}