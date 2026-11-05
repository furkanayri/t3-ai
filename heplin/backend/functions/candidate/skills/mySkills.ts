export default async function mySkills(ctx: Context) {
    const userId = ctx.state.user._id;

    const skills = await ctx.service("candidateSkills").findAll({
        userId
    },{
        populate: ["skills"]
    });
    ctx.body = skills
}


