export default async function getOneCertificate(ctx: Context) {
    const userId = ctx.state.user?._id;

    const certificate = await ctx.service("candidateCertificates").findOne({
        _id: ctx.params.certificateId,
        userId
    })

    ctx.body = { certificate };
}
