export default async function updateCV(ctx: Context) {
    const { title } = ctx.request.body;

    const { cvId } = ctx.params

    await ctx.service("cv").update(cvId, { title });

    ctx.body = { message: "CV updated successfully" }
}