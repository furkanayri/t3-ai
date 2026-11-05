export default async function createUserExperience(ctx: Context) {
    const { userId } = ctx.params;
    const experience = ctx.service("candidateExperiences").create({
        userId,
        ...ctx.request.body
    });
    ctx.body = { experience };
}