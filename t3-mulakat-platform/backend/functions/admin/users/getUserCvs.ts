export default async function getUserCvs(ctx:Context) {
    const { userId } = ctx.params;
    
    const cvs = await ctx.service("cv").findAll({
        userId: userId,
    });
    
    ctx.body = cvs;
}