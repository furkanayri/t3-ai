
export default async function updateAllCandidateInterview(ctx: Context) {
    const id = ctx.params.interviewId;

    const interview = await ctx.service('candidateInterview').update(id, {
        ...ctx.request.body
    });

    ctx.body = interview
}