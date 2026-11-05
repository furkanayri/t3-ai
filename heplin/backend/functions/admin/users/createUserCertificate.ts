import array from "@/utils/array"

export default async function createUserCertificate(ctx: Context) {
    const { userId } = ctx.params;
    ctx.request.body.userId = userId;
    ctx.request.body.files = array<any>(ctx.request.body.files).map((file) => ({
        ...file,
        uploadDate: new Date()
      }))
    const certificate = ctx.service("candidateCertificates").create(ctx.request.body);
    ctx.body = { certificate };
}