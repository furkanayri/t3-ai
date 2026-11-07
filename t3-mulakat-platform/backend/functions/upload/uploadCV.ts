export default async function uploadCV(ctx: Context) {
    const userId = ctx.state.user._id;
    const fileKey = ctx.state.fileKey;
    const { title } = ctx.request.body;

    const cv = await ctx.service("cv").create({
        userId: userId,
        fileName: fileKey,
        fileKey: fileKey,
        uploadedBy: userId,
        title: title,

    });
    ctx.state.cv = cv

    ctx.body = cv;
}
