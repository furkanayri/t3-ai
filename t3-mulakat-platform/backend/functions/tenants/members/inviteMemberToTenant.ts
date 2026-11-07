import { UserStatus } from "@/types/entities";
import {
  assignAllPermissionsToUser,
  countTenantMembers,
  sendInvitationEmail,
} from "./utils/membersUtils";
import { Types } from "mongoose";


export default async function inviteMemberToTenant(ctx: Context) {
  const { email } = ctx.request.body;

  const user: any = await ctx.service("users").findOne({
    email,
  });

  if (!user) {
    const newUser = await ctx.service("users").create({
      email,
      name: "",
      surname: "",
      status: "pending",
      phone: "",
    });

    const { registrationToken, registrationTokenExpires } =
      await sendInvitationEmail({ email });

    newUser.registrationToken = registrationToken;
    newUser.registrationTokenExpires = registrationTokenExpires;

    await newUser.save();

    await ctx.service("tenantMembers").create({
      userId: newUser._id,
      tenantId: ctx.params.tenantId,
      status: "pending",
    });

    await ctx
      .service("users")
      .updateOne({ _id: newUser._id }, { isTenantMember: true });

    const memberCount = await countTenantMembers(ctx, ctx.params.tenantId);

    if (memberCount === 1) {
      await assignAllPermissionsToUser(ctx, ctx.params.tenantId, newUser?._id);
    }

    ctx.body = {
      isSuccess: true,
      isSendRegistrationMail: true,
      email,
      user: newUser,
    };

    return;
  }

  if (user.isDeleted) ctx.throw(400, "User is deleted");

  if (
    (["deleted", "frozen", "passive"] as UserStatus[]).includes(user.status)
  ) {
    ctx.throw(400, "User is not active");
  }

  const tenantMember = await ctx.service("tenantMembers").findOne({
    userId: user._id,
    tenantId: ctx.params.tenantId,
  });

  if (tenantMember && tenantMember?.status === "active")
    ctx.throw(400, "User is already an active member of this tenant");
  if (tenantMember && tenantMember?.status !== "active")
    ctx.throw(400, "User is already member of this tenant, but not active");

  const existingTenantMember = await ctx.service("tenantMembers").findOne({
    userId: user?._id,
  });
  if (existingTenantMember)
    ctx.throw(400, "User is already registered to a tenant");

  if (!user.password && !user.googleId) {
    const { registrationToken, registrationTokenExpires } =
      await sendInvitationEmail({ email });

    user.registrationToken = registrationToken;
    user.registrationTokenExpires = registrationTokenExpires;

    await user.save();

    if (!user?._id || typeof user?._id !== "string")
      ctx.throw(400, "Invalid user id");

    await ctx.service("tenantMembers").create({
      userId: user._id,
      tenantId: ctx.params.tenantId,
      status: "pending",
    });

    await ctx
      .service("users")
      .updateOne({ _id: user._id }, { isTenantMember: true });

    const memberCount = await countTenantMembers(ctx, ctx.params.tenantId);

    if (memberCount === 1) {
      await assignAllPermissionsToUser(ctx, ctx.params.tenantId, user?._id);
    }

    ctx.body = {
      isSuccess: true,
      isSendRegistrationMail: true,
      email,
      user: user.toObject(),
    };
  } else {
    if (!user._id || (typeof user._id !== 'string' && !(user._id instanceof Types.ObjectId)))
      ctx.throw(400, "Invalid user id");
    await ctx.service("tenantMembers").create({
      userId: user._id,
      tenantId: ctx.params.tenantId,
      status: "active",
    });

    await ctx
      .service("users")
      .updateOne({ _id: user._id }, { isTenantMember: true });

    const memberCount = await countTenantMembers(ctx, ctx.params.tenantId);
    if (memberCount === 1) {
      await assignAllPermissionsToUser(ctx, ctx.params.tenantId, user?._id);
    }

    ctx.body = {
      isSuccess: true,
      isSendRegistrationMail: false,
      user: user.toObject(),
    };
  }
}
