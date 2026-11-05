export default async function deleteCertificate(ctx: Context) {
  const userId = ctx.state.user._id;

  const certificate = await ctx.service("candidateCertificates").softDelete({
    _id: ctx.params.certificateId,
    userId
  }, userId);
  ctx.body = {
    certificate
  };
}
