export default async function getAllEducationsOfTenant(ctx: Context) {
  const { tenantId } = ctx.params;

  const candidates = await ctx.service("candidates").findAll({ tenantId });

  const candidateUserIds = candidates?.results?.map(
    (candidate) => candidate.userId
  );

  const candidateEducations = await ctx.service("candidateEducations").findAll({
    userId: { $in: candidateUserIds },
  });

  ctx.body = candidateEducations;
}
