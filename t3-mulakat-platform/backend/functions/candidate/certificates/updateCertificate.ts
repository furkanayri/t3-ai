export default async function updateCertificate(ctx: Context) {
  const userId = ctx.state.user._id

  const certificate = await ctx.service("candidateCertificates").updateOne({
      _id: ctx.params.certificateId,
      userId
  }, ctx.request.body)

  ctx.body = { certificate };
}