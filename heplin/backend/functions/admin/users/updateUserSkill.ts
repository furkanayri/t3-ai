export default async function updateUserSkill(ctx: Context) {
    const { userId, skillId } = ctx.params;
    const skill = ctx.service("candidateSkills").updateOne(
        {
            _id: skillId,
            userId,
        },
        ctx.request.body
    );
    ctx.body = { skill };
}