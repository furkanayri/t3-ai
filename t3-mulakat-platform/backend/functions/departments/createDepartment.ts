import slugify from "@/utils/slugify"

export default async function createDepartment(ctx: Context) {
    const payload = { ...ctx.request.body, slug: slugify(ctx.request.body.name), tenantId: ctx.params.tenantId }
    const department = await ctx.service('departments').create(payload);
    ctx.body = { department };
}