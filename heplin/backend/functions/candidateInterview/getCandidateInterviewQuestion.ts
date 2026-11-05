
export default async function getCandidateInterviewQuestion(ctx: Context) {
    const id = ctx.params.interviewId;
    const interview = await ctx.service('interviewQuestions').findOne({ interviewId: id });
    ctx.body = interview
}