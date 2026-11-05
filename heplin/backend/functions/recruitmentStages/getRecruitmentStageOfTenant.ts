import mongoose from "mongoose";

export default async function getRecruitmentStageOfTenant(ctx: Context) {
    const { tenantId, recruitmentStageId } = ctx.params;

    const query = {
        tenantId: tenantId,
        _id: recruitmentStageId,
        isDeleted: { $ne: true }
    };

    const recruitmentStage = await ctx.service('recruitmentStages').findOne(query, {
        populate: [
            {
                path: 'stepsSort',
                select: '_id title color description recruitmentStageId'
            }
        ]
    });

    ctx.body = { recruitmentStage };
}   