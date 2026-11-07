export default async function getSkill(ctx: Context) {
    const { skillId } = ctx.params;

    const query = {
        _id: skillId,
        isDeleted: { $ne: true }
    };

    const skill = await ctx.service('skills').findOne(query);

    ctx.body = { skill };
}