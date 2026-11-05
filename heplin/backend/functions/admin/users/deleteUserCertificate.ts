export default async function deleteUserCertificate(ctx: Context) {
    const { userId, certificateId } = ctx.params;
    const admin = ctx.state.user;
    const skill = ctx
      .service("candidateCertificates")
      .softDelete({_id:certificateId,userId:userId}, admin);
    ctx.body = { skill };
  }
  