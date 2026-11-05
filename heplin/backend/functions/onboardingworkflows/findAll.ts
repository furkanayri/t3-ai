export default async function findAll(ctx: Context) {
    const { page, limit } = ctx.query;
    const query = {
        isDeleted: { $ne: true },
        tenantId: ctx.params.tenantId,
    };
    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };
    const onboardingworkflows = await ctx.service('onboardingworkflows').findAll({
        ...query, ...pagination
    });
    ctx.body = onboardingworkflows
}