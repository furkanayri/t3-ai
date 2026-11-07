export default async function updateUserCertificate(ctx: Context) {
  const { userId, certificateId } = ctx.params;
  const certificate = ctx.service("candidateCertificates").updateOne(
    {
      _id: certificateId,
      userId,
    },
    ctx.request.body
  );
  ctx.body = { certificate };
}
