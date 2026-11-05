import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";


export default async function createProfile(ctx: Context) {
  const { token, password, name, surname } = ctx.request.body;
  if (!token) return ctx.throw("Token is required");
  if (!password) return ctx.throw("Password is required");
  if (!name) return ctx.throw("Name is required");
  if (!surname) return ctx.throw("Surname is required");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await ctx.service("users").findOne({
    registrationToken: hashedToken,
    registrationTokenExpires: { $gt: Date.now() },
    isDeleted: { $ne: true },
    status: { $nin: ["passive", "frozen", "deleted"] },
  });

  if (!user) return ctx.throw("Token is invalid or has expired");

  await ctx.service("users").updateOne(
    {
      _id: user._id,
    },
    {
      password: hashedPassword,
      name,
      surname,
      registrationTokenExpires: null,
      registrationToken: null,
      status: "active",
    },
    {
      runValidators: true,
      new: true,
    }
  );

  const tenantMembers = await ctx.service("tenantMembers").updateOne(
    {
      userId: user._id,
    },
    {
      status: "active",
    },
    {
      runValidators: true,
      new: true,
    }
  );
  console.log("tenantMembers", tenantMembers);

  if (
    !(tenantMembers?.tenantId as any) || (typeof tenantMembers?.tenantId !== 'string' && !(tenantMembers?.tenantId instanceof Types.ObjectId))
  )
    return ctx.throw("Tenant member not found");

  if (!user._id || (typeof user._id !== 'string' && !(user._id instanceof Types.ObjectId)))
    ctx.throw(404, "Invalid user id");


  const employee = await ctx.service("employees").create({
    name: name,
    surname: surname,
    email: user?.email,
    phone: user?.phone,
    userId: user?._id,
    tenantId: (tenantMembers?.tenantId as any),
    type: "owner",
  });
  console.log("employee", employee);

  ctx.body = {
    isSuccess: true,
    message: "Profile created successfully",
    email: user.email,
  };
}
