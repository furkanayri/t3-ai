export default async function hiringTeam(ctx: Context) {
  const { jobId, tenantId } = ctx.params;

  const job = await ctx.service("jobs").findOne({ _id: jobId, tenantId });

  if (!job || !job.hiringTeams || job.hiringTeams.length === 0) {
    return ctx.throw(404, "Job or hiring team not found");
  }

  const hiringEmployeesResult = await ctx.service("employees").findAll({
    _id: { $in: job.hiringTeams },
    fields: "_id email name surname userId",
  });
  const hiringEmployees = hiringEmployeesResult?.results || [];

  // *** Kara listeye alınmış adayları alma ***
  const tenant = await ctx.service("tenants").findOne({ _id: tenantId });

  const blacklistedCandidateIds = tenant.blacklistedCandidates
    ? tenant.blacklistedCandidates.map((candidateId: any) =>
        candidateId.toString()
      )
    : [];

  // *** İş başvurularını alırken kara listeyi dikkate alma ***
  const jobApplicationsResult = await ctx.service("jobApplications").findAll(
    {
      jobId,
      tenantId,
      status: { $in: ["applied", "disqualified"] },
      candidateId: { $nin: blacklistedCandidateIds },
    },
    {
      populate: [
        { path: "currentRecruitmentStepId", select: "_id title color" },
        {
          path: "candidateId",
          select: "_id userId createdAt updatedAt name surname email",
        },
        { path: "jobId", select: "_id title" },
        { path: "employeeId", select: "_id email name surname userId" },
      ],
    }
  );
  const jobApplications = jobApplicationsResult?.results || [];

  const candidateIds = jobApplications.map(
    (application) => (application.candidateId as any)?._id
  );

  const aiEvaluationsResult = await ctx.service("aiEvaluation").findAll({
    candidateId: { $in: candidateIds },
    jobId: jobId,
  });
  const aiEvaluations = aiEvaluationsResult?.results || [];

  const aiEvaluationMap = {};
  aiEvaluations.forEach((evaluation) => {
    aiEvaluationMap[evaluation.candidateId.toString()] =
      evaluation.candidateScore;
  });

  jobApplications.forEach((application) => {
    const candidateId = (application.candidateId as any)?._id.toString();
    application.candidateScore = aiEvaluationMap[candidateId] || 0;
  });

  const appliedApplications = [];
  const disqualifiedApplications = [];
  jobApplications.forEach((application) => {
    if (application.status === "applied") {
      appliedApplications.push(application);
    } else if (application.status === "disqualified") {
      disqualifiedApplications.push(application);
    }
  });

  appliedApplications.sort((a, b) => b.candidateScore - a.candidateScore);

  const applicationsByEmployeeId = {};
  const unassignedApplications = [];
  appliedApplications.forEach((application) => {
    const employeeId = application.employeeId?._id?.toString();
    if (employeeId) {
      if (!applicationsByEmployeeId[employeeId]) {
        applicationsByEmployeeId[employeeId] = [];
      }
      applicationsByEmployeeId[employeeId].push(application);
    } else {
      unassignedApplications.push(application);
    }
  });

  const employeeMap = {};
  hiringEmployees.forEach((employee) => {
    employeeMap[employee._id.toString()] = employee;
  });

  const formattedApplications = Object.keys(applicationsByEmployeeId).map(
    (employeeId) => ({
      employee: employeeMap[employeeId] || null,
      applications: applicationsByEmployeeId[employeeId],
    })
  );

  const response = {
    job,
    hiringEmployees,
    results: [
      ...formattedApplications,
      {
        employee: null,
        applications: unassignedApplications,
      },
    ],
    count: jobApplicationsResult?.count,
    limit: jobApplicationsResult?.limit,
    page: jobApplicationsResult?.page,
    totalPage: jobApplicationsResult?.totalPage,
    disqualified: disqualifiedApplications,
  };

  ctx.body = response;
}
