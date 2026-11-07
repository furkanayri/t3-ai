export default async function fetchApplications(ctx: Context) {
  const { page, limit, applicantId, identificationNumber, jobName, candidate } =
    ctx.query;
  const pagination = {
    page: page || 1,
    limit: limit || 10,
    sort: "-createdAt",
  };

  const query: any = {};
  if (applicantId) query._id = applicantId;

  const res = await ctx.service("jobApplications").findAll(
    { ...query },
    {
      populate: [
        {
          path: "currentRecruitmentStepId",
          select: "_id title color",
        },
        {
          path: "candidateId",
          select: "_id userId createdAt updatedAt name surname",
        },
        {
          path: "jobId",
          select: "_id title",
        },
        {
          path: "userId",
          select: "_id email name surname identificationNumber gender",
        },
      ],
    }
  );
  const strFormat = (str: string) => str?.toLowerCase().replace(/\s+/g, "");

  if (identificationNumber) {
    res.results = res.results.filter((application: any) => {
      return application.userId?.identificationNumber === identificationNumber;
    });
  }
  if (candidate) {
    console.log(candidate);

    res.results = res?.results?.filter((application: any) => {
      return (
        strFormat(application?.userId?.name)?.includes(
          strFormat(candidate as string)
        ) ||
        strFormat(application?.userId?.surname)?.includes(
          strFormat(candidate as string)
        )
      );
    });
  }
  if (jobName) {
    res.results = res.results.filter((application: any) => {
      return strFormat(application.jobId.title).includes(strFormat(jobName as string));
    });
  }



  const start = (Number(pagination.page) - 1) * Number(pagination.limit);
  const end = Number(pagination.page) * Number(pagination.limit);

  ctx.body = {
    results: res.results.slice(start, end),
    count: res.results.length,
    page: +pagination.page,
    limit: +pagination.limit,
    totalPage: Math.ceil(res.results.length / Number(pagination.limit)),
  };
}
