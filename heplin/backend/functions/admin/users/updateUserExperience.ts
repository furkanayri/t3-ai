export default async function updateUserExperiences(ctx:Context) {
        const {userId} = ctx.params

        const experience = await ctx.service("candidateExperiences").updateOne({
            _id: ctx.params.experienceId,
            userId
        }, ctx.request.body)
    
        ctx.body = { experience };
}