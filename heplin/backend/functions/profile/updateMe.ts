import bcrypt from "bcryptjs";

export default async function updateMe(ctx: Context) {
  const user = ctx.state.user;

  const { avatar, ...otherData } = ctx.request.body;
  if (typeof avatar !== "undefined") {
    otherData.avatar = avatar;
  }
  // if(otherData.password){
  //   const hashedPassword = await bcrypt.hash(otherData.password, 12);
  //   otherData.password = hashedPassword;
  // }
  await ctx.service("users").update(user._id, otherData);
  ctx.status = 200;

  ctx.body = {
    isSuccess: true,
  };
}
