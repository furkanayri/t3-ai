export default async function get(ctx: Context) {
    const candidateId = ctx.params.candidateId;

    const candidate = await ctx.service('candidates').findOne({
        _id: candidateId,
    });

    const personalTest = await ctx.service('personalityTestResult').findOne({
        userId: candidate?.userId,
    });

    ctx.body = { personalTest };
}
