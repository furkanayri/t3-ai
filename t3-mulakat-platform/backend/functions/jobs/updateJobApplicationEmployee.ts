import { Types } from "mongoose";
export default async function updateJobApplicationEmployee(ctx: Context) {
  const { tenantId, jobId } = ctx.params;
  const { newEmployeeId, applicantId, currentEmployeeId } = ctx.request.body;

  const foundJob: any = await ctx.service("jobApplications").findOne({
    tenantId,
    jobId,
    employeeId: currentEmployeeId,
    candidateId: applicantId,
  });

  const payload = {
    employeeId: newEmployeeId,
  };

  //TODO: Add validation for foundJob because it does not want type of unkown or null
  if (!foundJob || (typeof foundJob._id !== 'string' && !(foundJob._id instanceof Types.ObjectId))) {
    const res = await ctx
      .service("jobApplications")
      .update(foundJob._id, payload);
    ctx.body = { job: res };
  } else {
    ctx.throw(404, "Job not found");
  }
}
