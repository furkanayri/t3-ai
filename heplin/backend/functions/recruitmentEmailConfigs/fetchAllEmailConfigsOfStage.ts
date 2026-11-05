export default async function fetchAllEmailConfigsOfStage(ctx: Context) {
    const tenantId = ctx.params.tenantId
    const recruitmentStageId = ctx.query.stageId

    console.log(recruitmentStageId)

    const res = await ctx.service("recruitmentEmailConfigs")
        .findAll(
            { tenantId, recruitmentStageId },
            {
                populate: [{
                    path: "recruitmentStageStepId",
                    select: "_id title description color"
                }]
            }
        )

    ctx.body = res
}