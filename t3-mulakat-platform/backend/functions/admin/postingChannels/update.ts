import { applicationTypes } from "./create";

export default async function updatePostingChannel(ctx: Context) {
  const { tenantId, channelId } = ctx.params;
  const payload = ctx.request.body;

  const parentTenant = await ctx.service("tenants").findById(tenantId);
  if (parentTenant.parentTenantId)
    ctx.throw(401, "You are not allowed to update posting channels");

  const type = payload.application;
  if (!applicationTypes.includes(type))
    ctx.throw(401, "Invalid posting channel type");

  if (payload?.tenantId?.toString() === parentTenant?._id?.toString()) {
    const existingCareerPagePostingChannel = await ctx
      .service("postingChannels")
      .findOne({
        _id: channelId,
        tenantId: parentTenant?._id,
        type,
      });

    if (
      !existingCareerPagePostingChannel?._id ||
      typeof existingCareerPagePostingChannel?._id !== "string"
    )
      ctx.throw(404, "Posting channel not found");

    const updatedPostingChannel = await ctx
      .service("postingChannels")
      .update(existingCareerPagePostingChannel?._id ?? "", payload);
    ctx.body = { postingChannel: updatedPostingChannel };
  } else {
    const subTenant = await ctx.service("tenants").findById(payload?.tenantId);
    if (subTenant.parentTenantId !== parentTenant?._id)
      ctx.throw(401, "Invalid tenant id");

    const existingCareerPagePostingChannel = await ctx
      .service("postingChannels")
      .findOne({
        _id: channelId,
        tenantId: subTenant?._id,
        type,
      });

    delete payload.connectionChannelId;

    if (
      !existingCareerPagePostingChannel?._id ||
      typeof existingCareerPagePostingChannel?._id !== "string"
    )
      ctx.throw(404, "Posting channel not found");

    const updatedPostingChannel = await ctx
      .service("postingChannels")
      .update(existingCareerPagePostingChannel?._id, payload);
    ctx.body = { postingChannel: updatedPostingChannel };
  }
}
