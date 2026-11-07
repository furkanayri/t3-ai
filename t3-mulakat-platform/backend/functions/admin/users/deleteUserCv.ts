export default async function deleteUserCv(ctx: Context) {
  const { userId, cvId } = ctx.params;
  const admin = ctx.state.user;
  const skill = ctx
    .service("cv")
    .softDelete({ _id: cvId, userId: userId }, admin);
  ctx.body = { skill };
}
