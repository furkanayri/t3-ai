export default async function getAllCVsOfCandidate(ctx: Context) {
    const { candidateId, tenantId } = ctx.params
   
    
    const candidate = await ctx.service("candidates").findOne({
        _id: candidateId,
    })
    // tenantId
    
    if (!candidate) {
        return ctx.throw(404, "Candidate not found")
    }

    const results = await ctx.service("cv").findAll({
        userId: candidate.userId,
    })

    ctx.body = results
}