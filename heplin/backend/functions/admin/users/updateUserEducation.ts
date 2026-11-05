export default async function updateUserEducation(ctx: Context) {
  const { userId, educationId } = ctx.params;
  const education = ctx.service("candidateEducations").updateOne(
    {
      _id: educationId,
      userId,
    },
    ctx.request.body
  );
  ctx.body = { education };
}
