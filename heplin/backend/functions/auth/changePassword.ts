import bcrypt from "bcryptjs";
import { Types } from "mongoose";

export default async function changePassword(ctx: Context) {
  const { token, id, password } = ctx.request.body;

  if (!token || !id || !password)
    ctx.throw("Token, ID, and password are required");

  const user = await ctx.service("users").findOne({ _id: id });

  if (!user) ctx.throw("User not found");

  const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);

  if (!isTokenValid || user.resetPasswordExpires.getTime() < Date.now()) {
    ctx.throw("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!user._id || (typeof user._id !== 'string' && !(user._id instanceof Types.ObjectId)))
    ctx.throw(404, "Invalid user id");

  await ctx.service("users").update(user?._id ?? "", {
    password: hashedPassword,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  });

  ctx.body = { message: "Password has been reset successfully" };
}
