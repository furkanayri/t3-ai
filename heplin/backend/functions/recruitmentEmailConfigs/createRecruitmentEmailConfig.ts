import { Types } from "mongoose";

export default async function createRecruitmentEmailConfig(ctx: Context) {
  const { tenantId } = ctx.params;

  const payload = {
    ...ctx.request.body,
    tenantId,
  };

  //Update config if already exists
  const existingConfig = await ctx.service("recruitmentEmailConfigs").findOne({
    tenantId,
    recruitmentStageId: payload?.recruitmentStageId,
    recruitmentStageStepId: payload?.recruitmentStageStepId,
  });

  //TODO: Add validation for existingConfig because it does not want type of unkown or null
  /**
        functions/recruitmentEmailConfigs/createRecruitmentEmailConfig.ts(17,76): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'
    */
  if (!existingConfig || (typeof existingConfig._id !== 'string' && !(existingConfig._id instanceof Types.ObjectId))) {
    const config = await ctx
      .service("recruitmentEmailConfigs")
      .update(existingConfig?._id as any, payload);
    ctx.body = { config };
  } else {
    const config = await ctx.service("recruitmentEmailConfigs").create(payload);
    ctx.body = { config };
  }
}
