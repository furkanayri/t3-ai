export default async function deleteApplication(ctx: Context) {
  const userId = ctx.state.user._id;

  const application = await ctx.service("jobApplications").findOne({
    _id: ctx.params.applicationId,
  });

  if (!application) return ctx.throw(404, "Application not found");

  if (application.userId.toString() !== userId.toString())
    return ctx.throw(403, "You are not authorized to draw this application");

  //TODO: Add validation for application because it does not want type of unkown or null
  //functions/candidate/deleteApplication.ts(12,49): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
  await ctx.service("jobApplications").delete(application._id as any);

  ctx.body = {
    isSuccess: true,
  };
}
