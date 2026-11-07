import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";

export default async function archiveJobApplicants(ctx: Context) {
    const { jobId, tenantId, params } = ctx.params;

    const query: any = {
        status: 'applied',
    };
    const {
        page,
        limit,
        status,
        name,
        isAppliedViaWhatsapp,
        startDate,
        endDate,
    } = ctx.query;
    console.log("ctx.query", ctx.query);
    const pagination = {
        page: page || 1,
        limit: limit || 10,
        // sort: "-candidateScore",
    };

    if (name) {
        query.$or = [
            { name: { $regex: name, $options: "i" } },
            { surname: { $regex: name, $options: "i" } },
        ];
    }

    if (isAppliedViaWhatsapp) {
        query.isAppliedViaWhatsapp = true
    }

    if (status === "onBoarding") {
        query.status = { $in: ["onBoarding", "hired"] };
        query.onboardingId = { $exists: true };
    } else {
        query.status = status;
    }

    function convertDateFormat(dateString) {
        const formattedDateString = dateString.replace(" ", "+");
        const date = new Date(formattedDateString);
        const isoString = date.toISOString();
        return isoString;
    }

    if (startDate && endDate) {
        const startDateString = Array.isArray(startDate) ? startDate[0] : startDate;
        const endDateString = Array.isArray(endDate) ? endDate[0] : endDate;
        query.createdAt = {
            gte: convertDateFormat(startDateString),
            lte: convertDateFormat(endDateString),
        };
    }

    const tenant = await ctx.service("tenants").findOne(
        { _id: tenantId },
    );
    console.log("tenant", tenant);

    const res = await ctx.service("jobApplicationsArchives").findAll(
        {
            jobId,
            tenantId,
            ...query,
            ...pagination,
        },
        {
            populate: [
                {
                    path: "currentRecruitmentStepId",
                    select: "_id title color",
                },
                {
                    path: "candidateId",
                    select: "_id userId createdAt updatedAt name surname email",
                },
                {
                    path: "jobId",
                    select: "_id title",
                },

            ],
        }
    );

    const userRes = await getAllUsersByPopulate(ctx, {
        populateIds: res.results.map((item: any) => item.candidateId?.userId),
        select: "_id email name surname avatar phone email",
    });

    ctx.body = {
        ...res,
        results: res.results.map((item) => {
            const user = userRes.results?.find(
                (user: any) =>
                    user._id === (item.candidateId as any)?.userId?.toString()
            );
            return {
                ...item.toJSON(),
                candidateId: {
                    ...(item.candidateId as any).toJSON(),
                    userId: user,
                },
            };
        }),
    };
}