
export default async function getOneCandidateAnswers(ctx: Context) {
    const id = ctx.params.candidateAnswerId;
    console.log(id);

    const interview = await ctx.service('candidateInterviewAnswers').findById(id);
    ctx.body = interview
}