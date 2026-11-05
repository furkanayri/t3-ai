export default async function getUserCertificates(ctx: Context) {
    const userId = ctx.params.userId

    const certificates = await ctx.service("candidateCertificates").findAll(
        { userId: userId },
    );

    ctx.body = certificates
}