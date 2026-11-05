import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";

export default async function getOneJobApplication(ctx) {
    // Assuming ctx.params contains jobId and candidateId
    const { jobId, candidateId, tenantId } = ctx.params;

    // Validate the existence of the candidate
    const candidate = await ctx.service("candidates").findOne({
        _id: candidateId,
        tenantId
    });

    if (!candidate) {
        return ctx.throw(404, "Candidate not found");
    }

    // Get user details for the candidate
    const userRes = await getAllUsersByPopulate(ctx, {
        populateIds: [candidate.userId],
        select: "_id name surname email"
    });

    // Retrieve the specific job application using jobId and candidateId
    const jobApplication = await ctx.service("jobApplications").findOne({
        jobId,
        candidateId,
        tenantId
    }, {
        select: "_id jobId currentRecruitmentStepId createdAt updatedAt employeeId cv coverLetter matchingScore",
        populate: [
            {
                path: "jobId",
                select: "_id title"
            },
            {
                path: "currentRecruitmentStepId",
                select: "_id title color"
            },
            {
                path: "cv",
                select: "_id filePath"
            }
        ],
    });

    if (!jobApplication) {
        return ctx.throw(404, "Job Application not found");
    }

    // Assuming you want to enrich the job application data with candidate and user info
    ctx.body = {
        jobApplication: {
            ...jobApplication.toJSON(),
            candidate: {
                ...candidate.toJSON(),
                user: userRes.results?.[0] || {}
            }
        }
    };
}
