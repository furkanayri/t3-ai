export default async function createUserSkill(ctx: Context) {
  const { userId } = ctx.params;
  const skill = await ctx
    .service("candidateSkills")
    .create({ ...ctx.request.body, userId });
  ctx.body = { skill };
}
