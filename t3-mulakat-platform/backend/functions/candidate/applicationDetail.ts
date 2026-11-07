import { getAllTenantsByPopulate } from "@/utils/populate/getAllTenantsByPopulate";

export default async function applicationDetail(ctx: Context) {
    const { user } = ctx.state;

    const application = await ctx.service("jobApplications").findOne({
        _id: ctx.params.applicationId,
    }, {
        populate: [
            {
                path: "jobId",
                select: "title jobType locationType country city district content applicantForm"
            },
            {
                path: "tenantId",
                select: "name logo _id"
            },
        ]
    })

    if (!application) throw new Error("Application not found");

    const candidateDetail = await ctx.service("candidates").findOne({
        _id: application.candidateId
    })

    if (!candidateDetail) throw new Error("Candidate not found");

    if (candidateDetail.userId.toString() !== user._id.toString()) return ctx.throw(403, "You are not authorized to view this application");

    ctx.body = {
        application: {
            ...application.toObject(),
        }
    };
}