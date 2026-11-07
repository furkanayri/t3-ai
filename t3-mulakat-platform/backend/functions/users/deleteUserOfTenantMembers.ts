import { Types } from "mongoose";
export default async function deleteUserOfTenantMembers(ctx: Context) {
  const { userId } = ctx.params;

  const res: any = await ctx.service("tenantMembers").findOne({
    userId: userId,
  });

  if (!res) ctx.throw(400, "User not found");

  await ctx.service("users").delete(userId);

  if (res._id && ((typeof res._id === 'string') || (res._id instanceof Types.ObjectId))) {
    await ctx.service("tenantMembers").delete(res._id);
  } else {
    await ctx.service("tenantMembers").delete(res._id);
  }

  ctx.body = { isSuccess: res };
}
