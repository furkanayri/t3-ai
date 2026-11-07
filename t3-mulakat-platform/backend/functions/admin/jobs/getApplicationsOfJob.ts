export default async function getApplicationsOfJob(ctx: Context) {
    const { jobId } = ctx.params;
    const { page, limit, name, identificationNumber, _id } = ctx.query;
    const pagination = {
        page: page || 1,
        limit: limit || -1,
        sort: "-createdAt",
    };

    const query: any = {
        jobId,
        isDeleted: { $ne: true },
        status: 'applied'
    }

    if (_id)
        query._id = _id;

    const applications = await ctx.service("jobApplications").findAll({
        ...query
    }, {
        populate: [
            {
                path: "currentRecruitmentStepId",
                select: "_id title color",
            },
            {
                path: 'candidateId',
                select: '_id name surname email'
            },
            {
                path: 'jobId',
                select: '_id title'
            },
            {
                path: "userId",
                select: "_id email name surname identificationNumber gender",
            },
        ]
    });

    if (name) {
        const strFormat = (str: string) => str.toLowerCase().replace(/\s+/g, "");
        applications.results = applications.results.filter((application: any) => {
            return strFormat(application?.userId?.name).includes(strFormat(name as string))
                || strFormat(application.userId.surname).includes(strFormat(name as string));
        });
    }

    if (identificationNumber) {
        applications.results = applications.results.filter((application: any) => {
            return application.userId?.identificationNumber === identificationNumber;
        });
    }

    const start = (Number(pagination.page) - 1) * Number(pagination.limit);
    const end = Number(pagination.page) * Number(pagination.limit);

    ctx.body = {
        results: applications.results.slice(start, end),
        count: applications.results.length,
        page: +pagination.page,
        limit: +pagination.limit,
        totalPage: Math.ceil(applications.results.length / Number(pagination.limit)),
    };
}