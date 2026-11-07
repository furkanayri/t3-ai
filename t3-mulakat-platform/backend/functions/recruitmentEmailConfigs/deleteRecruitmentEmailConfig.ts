export default async function deleteRecruitmentEmailConfig(ctx: Context) {
    const { tenantId, configId } = ctx.params
    const { user } = ctx.state;

    const config = await ctx.service('recruitmentEmailConfigs')
        .softDelete({ tenantId, _id: configId }, user?._id);

    ctx.body = {
        isSuccess: true,
    };
}