export default async function myEducations(ctx: Context) {
  const userId = ctx.state.user._id;

  const educations = await ctx.service("candidateEducations").findAll({
    userId,
  });

  ctx.body = educations;
}
