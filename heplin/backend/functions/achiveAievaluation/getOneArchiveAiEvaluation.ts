export default async function getOneAiEvaluation(ctx: Context) {

    const { candidateId, jobId } = ctx.params


    const aiEvaluation = await ctx.service('archiveAiEvaluation').findOne({ candidateId: candidateId, jobId: jobId });

    ctx.body = aiEvaluation;
}