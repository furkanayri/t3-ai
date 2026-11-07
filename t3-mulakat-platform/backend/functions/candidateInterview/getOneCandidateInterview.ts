
export default async function getOneCandidateInterview(ctx: Context) {
    const id = ctx.params.interviewId;
    const interview = await ctx.service('candidateInterview').findById(id);
    ctx.body = interview
}