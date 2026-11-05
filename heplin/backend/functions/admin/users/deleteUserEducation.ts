export default async function deleteUserEducation(ctx: Context) {
  const { userId, educationId } = ctx.params;
  const admin = ctx.state.user;
  const skill = ctx
    .service("candidateEducations")
    .softDelete({ _id: educationId, userId: userId }, admin);
  ctx.body = { skill };
}
