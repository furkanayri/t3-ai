export default async function deleteUserSkill(ctx: Context) {
  const { userId, skillId } = ctx.params;
  const admin = ctx.state.user;
  const skill = ctx
    .service("candidateSkills")
    .softDelete({ _id: skillId, userId: userId }, admin);
  ctx.body = { skill };
}
