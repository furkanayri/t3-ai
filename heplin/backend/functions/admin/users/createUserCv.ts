export default async function createUserCv(ctx: Context) {
  const { userId } = ctx.params;
  const fileKey = ctx.state.fileKey;
  const { title } = ctx.request.body;

  const cv = await ctx.service("cv").create({
    userId: userId,
    fileName: fileKey,
    uploadedBy: userId,
    fileKey: fileKey,
    title: title,
  });
  ctx.state.cv = cv

  ctx.body = cv;
}