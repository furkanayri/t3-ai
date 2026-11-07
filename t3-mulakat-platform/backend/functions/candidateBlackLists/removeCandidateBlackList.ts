import { Types } from "mongoose";

export default async function removeCandidateBlackList(ctx: Context) {
  const { candidateId, tenantId } = ctx.request.body;

  const candidate = await ctx.service("candidates").findOne({
    _id: candidateId,
    tenantId,
  });
  if (!candidate) {
    return ctx.throw(404, "Candidate not found", { candidateId });
  }

  await ctx.service("tenants").findOne({
    _id: tenantId,
  });

  const blackListEntry = await ctx.service("candidateBlackLists").findOne({
    candidateId: candidateId,
    tenantId: tenantId,
    isRemoveBlackList: false,
  });
  if (!blackListEntry) {
    return ctx.throw(404, "Blacklist entry not found for the candidate", {
      candidateId,
      tenantId,
    });
  }
  if (!blackListEntry._id || (typeof blackListEntry._id !== 'string' && !(blackListEntry._id instanceof Types.ObjectId))) {
    ctx.throw(404, "Invalid blacklist entry id");
  }

  await ctx
    .service("candidateBlackLists")
    .update(blackListEntry._id, { isRemoveBlackList: true });

  await ctx.service("tenants").updateOne(
    { _id: tenantId },
    {
      $pull: {
        blacklistedCandidates: candidateId,
      },
    }
  );

  ctx.body = {
    message: "Candidate blacklist removed successfully",
  };
}
