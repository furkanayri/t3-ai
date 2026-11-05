export default async function createUserEducation(ctx: Context) {
    const { userId } = ctx.params;
    const education = ctx.service("candidateEducations").create({
        userId,
        ...ctx.request.body
    });
    ctx.body = { education };
}