import { Types } from "mongoose";
export default async function removeMemberFromTenant(ctx: Context) {
  const { memberId, tenantId } = ctx.params;

  const member: any = await ctx.service("tenantMembers").findOne({
    tenantId,
    userId: memberId,
  });

  if (!member) ctx.throw(400, "Member not found");

  if (!member._id || (typeof member._id !== 'string' && !(member._id instanceof Types.ObjectId)))
    ctx.throw(400, "Member not found");
  await ctx.service("tenantMembers").delete(member._id);

  await ctx
    .service("users")
    .delete(
      (member.userId as any)?._id
        ? (member?.userId as any)?._id
        : member?.userId
    );

  ctx.body = {
    isSuccess: true,
  };
}
