export default async function getInterviewAnswers(ctx: Context) {
    const { candidateAnswerId } = ctx.params
    const interview = await ctx.service('candidateInterviewAnswers').findById(candidateAnswerId)

    ctx.body = interview

}