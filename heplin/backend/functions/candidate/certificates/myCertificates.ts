export default async function myCrtificates(ctx: Context) {
  const userId = ctx.state.user._id;

  const certificates = await ctx.service("candidateCertificates").findAll({
      userId
  });

  ctx.body = certificates;
}
