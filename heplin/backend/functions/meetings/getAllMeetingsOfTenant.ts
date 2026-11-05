import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";

export default async function getAllMeetingsOfTenant(ctx: Context) {
    const { tenantId } = ctx.params;
    const query: any = {
        tenantId: tenantId,
    };

    if (ctx.query.status) {
        query.status = ctx.query.status
    }
    const { page, limit } = ctx.query

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const meetings = await ctx.service('meetings').findAll({ ...query, ...pagination }, {
        populate: [
            {
                path: "recruitmentStageStepId",
                select: "_id title color"
            },
            {
                path: "jobId",
                select: "_id title slug"
            },
            {
                path: "candidateId",
                select: "_id userId name surname email createdAt updatedAt"
            },
            {
                path: "hostId",
                select: "_id name surname email"
            },
            {
                path: "attendees.employeeId",
                select: "_id name surname email"
            }
        ]
    });
    const createdByUserIds = meetings.results.map((item: any) => item.createdBy?.toString()).filter(Boolean);

    const userRes = await ctx.service('users').findAll({
        _id: {
            $in: [...createdByUserIds]
        }
    });

    ctx.body = {
        ...meetings,
        results: meetings.results.filter(item => !!item.candidateId).map((item) => {
            const creator = userRes.results?.find((user: any) => user._id?.toString() === item.createdBy?.toString())
            return {
                ...item.toJSON(),
                createdBy: {
                    _id: creator?._id,
                    name: creator?.name,
                    surname: creator?.surname,
                    email: creator?.email
                }
            }
        })
    }
}