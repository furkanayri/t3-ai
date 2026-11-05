
export default async function getAllCandidateInterview(ctx: Context) {
    const userId = ctx.state.user._id;
    const interview = await ctx.service('candidateInterview').findAll({ userId: userId });
    ctx.body = interview
}