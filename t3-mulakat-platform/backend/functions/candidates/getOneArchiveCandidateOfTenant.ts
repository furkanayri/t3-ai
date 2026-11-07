export default async function getOneArchiveCandidateOfTenant(ctx: Context) {
    const { candidateId, tenantId } = ctx.params;

    const candidate = await ctx.service("candidateArchives").findOne(
        {
            _id: candidateId,
        },
        // {
        //     populate: [
        //         {
        //             path: "userId",
        //             select: "_id name surname email phone avatar",
        //         },
        //     ],
        // }
    );
    if (!candidate) {
        return ctx.throw(404, " Archive Candidate not found");
    }

    const appliedJobsOfCandidates = await ctx.service("jobApplicationsArchives").findAll(
        {
            candidateId: candidate._id,
            tenantId,
        },
        {
            select: "_id jobId currentRecruitmentStepId createdAt updatedAt cv",
            populate: [
                {
                    path: "jobId",
                },
                {
                    path: "currentRecruitmentStepId",
                    select: "_id title color",
                },
                {
                    path: "cv",
                },
            ],
        }
    );

    // const experiences = await ctx.service("candidateExperiences").findAll({
    //     userId: (candidate.userId as any)?._id?.toString(),
    // });

    // const educations = await ctx.service("candidateEducations").findAll({
    //     userId: (candidate.userId as any)?._id?.toString(),
    // });
    // const languages = await ctx.service("candidateLanguages").findAll({
    //     userId: (candidate.userId as any)?._id?.toString(),
    // });
    // const skills = await ctx.service("candidateSkills").findAll(
    //     {
    //         userId: (candidate.userId as any)?._id?.toString(),
    //     },
    //     {
    //         populate: [
    //             {
    //                 path: "skills",
    //                 select: "name",
    //             },
    //         ],
    //     }
    // );
    // const certificates = await ctx.service("candidateCertificates").findAll({
    //     userId: candidate.userId,
    // });

    ctx.body = {
        candidate: {
            ...candidate.toJSON(),
            appliedJobs: appliedJobsOfCandidates.results,
            // experiences: experiences.results,
            // educations: educations.results,
            // languages: languages.results,
            // skills: skills.results,
            // certificates: certificates.results,
        },
    };
}
