import slugify from "@/utils/slugify";

export default async function createSkill(ctx: Context) {
    ctx.request.body.isVisible = false;
    ctx.request.body.slug = slugify(ctx.request.body.name)

    const skills = await ctx.service('skills').create(ctx.request.body);
    ctx.body = { skills };
}