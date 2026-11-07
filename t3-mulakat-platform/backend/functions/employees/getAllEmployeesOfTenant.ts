export default async function getAllEmployeesOfTenant(ctx: Context) {
  const { tenantId } = ctx.params;
  const { page, limit } = ctx.query;
  const pagination = {
    page: page || 1,
    limit: limit || 10,
    sort: "-createdAt",
  };

  const query = {
    tenantId: tenantId,
    isDeleted: { $ne: true },
  };
  const employees = await ctx
    .service("employees")
    .findAll({ ...query, ...pagination });
  ctx.body = employees;
}
