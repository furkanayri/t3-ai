export default  async function getById(ctx: Context) {
    // admin can sees candidate's all information
    const { userId } = ctx.params;
    const cv = await ctx.service("cv").findAll({ userId });
    const user = await ctx.service("users").findOne({_id: userId})
    const candidateExperiences = await ctx.service("candidateExperiences").findAll({ userId });
    const candidateEducations = await ctx.service("candidateEducations").findAll({ userId });
    const candidateCertificates = await ctx.service("candidateCertificates").findAll({ userId });
    const candidateLanguages = await ctx.service("candidateLanguages").findAll({ userId });
    const candidateSkills = await ctx.service("candidateSkills").findAll({ userId });

    ctx.body = {
        user,
        cv,
        candidateExperiences,
        candidateEducations,
        candidateCertificates,
        candidateLanguages,
        candidateSkills,
    };
}   