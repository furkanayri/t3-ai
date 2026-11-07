import bcrypt from "bcryptjs";

export default async function updateOneUser(ctx: Context) {
  const userId = ctx.params.userId;
  const payload = ctx.request.body;
  if (payload.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 12);
    payload.password = hashedPassword;
  }

  const res = await ctx.service("users").updateOne({ _id: userId }, payload);

  ctx.body = { user: res };
}
