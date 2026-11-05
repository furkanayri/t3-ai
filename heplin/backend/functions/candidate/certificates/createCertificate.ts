import array from "@/utils/array"

export default async function createCertificate(ctx: Context) {
  const userId = ctx.state.user._id;

  ctx.request.body.userId = userId;

  ctx.request.body.files = array<any>(ctx.request.body.files).map((file) => ({
    ...file,
    uploadDate: new Date()
  }))
  const certificate = await ctx.service("candidateCertificates").create(ctx.request.body);

  ctx.body = {
    certificate
  };
}