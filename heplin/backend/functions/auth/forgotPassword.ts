import sendEmail from "@/utils/mail/sendMail";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Types } from "mongoose";

export default async function forgotPassword(ctx: Context) {
  const { email } = ctx.request.body;

  if (!email) ctx.throw(400, "Email is required")

  const user = await ctx.service("users").findOne({ email });

  if (!user) ctx.throw(400, "User not found")

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = await bcrypt.hash(resetToken, 10);



  if (!user._id || (typeof user._id !== 'string' && !(user._id instanceof Types.ObjectId)))
    ctx.throw(404, "Invalid user id");

  await ctx.service("users").update(user?._id ?? "", {
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: Date.now() + 3600000,
  });

  const resetUrl = `${process.env.WEB_APP_URL}/reset-password?token=${resetToken}&id=${user._id}`;

  await sendEmail(
    "mail@heplin.com",
    user.email,
    "Forgot Password",
    "forgot-password",
    {
      name: user.name,
      resetUrl,
    }
  );

  ctx.body = {
    message: "Şifre sıfırlama linki e-posta adresinize gönderildi.",
  };
}
