export default async function getAllTenantsList(ctx: Context) {
  const { adminTenantId: tenantId } = ctx.params;
  const { status,page, limit } = ctx.query;
  let query: any = {};
  const pagination = {
    page: page || 1,
    limit: limit || 10,
    sort: "-createdAt",
  };
  if (status === "active") query.status = "active";
  if (status === "disabled") query.status = "inactive";
  if (status === "unpaid") query.status = "pending";
  const res = await ctx.service("tenants").findAll({
    $or: [{ _id: tenantId }, { parentTenantId: tenantId }],
    sort: "createdAt",
    status: query?.status,
    ...pagination,
  });

  ctx.body = res;
}
