export default async function createEducation(ctx: Context) {
    const userId = ctx.state.user._id;

    ctx.request.body.userId = userId;
    const education = await ctx.service("candidateEducations").create(ctx.request.body);

    ctx.body = {
        education
    };
}