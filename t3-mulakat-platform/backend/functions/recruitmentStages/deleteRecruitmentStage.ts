export default async function getAllDepartmentsOfTenant(ctx: Context) {
    const { tenantId, recruitmentStageId } = ctx.params;
    const { user } = ctx.state;

    const recruitmentStage = await ctx.service('recruitmentStages').softDelete({
        tenantId,
        _id: recruitmentStageId,
    }, user?._id);
    ctx.body = { isSuccess: recruitmentStage };
}