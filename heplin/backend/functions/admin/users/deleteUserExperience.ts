export default async function deleteUserExperience(ctx: Context) {
  const { userId, experienceId } = ctx.params;
  const admin = ctx.state.user;
  const skill = ctx
    .service("candidateExperiences")
    .softDelete({ _id: experienceId, userId: userId }, admin);
  ctx.body = { skill };
}
