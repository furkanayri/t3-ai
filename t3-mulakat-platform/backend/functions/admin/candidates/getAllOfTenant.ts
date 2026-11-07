import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";
import querystring from "querystring";

export default async function getAllOfTenant(ctx: Context) {
  const token = ctx.request.headers.authorization?.replace(`Bearer `, "") || ctx.cookies.get('token'); // Get token from cookies
  const { tenantId } = ctx.params
  const { page, limit } = ctx.query;

  const { filter_tenantId } = ctx.request.query
  const queryString: any = ctx.query.query;
  const parsedQuery = querystring.parse(queryString);

  let query: any = {
    tenantId,
  };

  if (parsedQuery.name) {
    query.$or = [
      { name: { $regex: parsedQuery.name, $options: "i" } },
      { surname: { $regex: parsedQuery.name, $options: "i" } },
    ];
  }
  if (parsedQuery.userIdForEducation) {
    query.userId = parsedQuery.userIdForEducation;
  }

  const pagination = {
    page: page || 1,
    limit: limit || 10,
    sort: "-createdAt",
  };

  const tenant = await ctx.service('tenants').findById(tenantId)
  if (!tenant) ctx.throw(401, "Tenant not found")
  const subTenants = (await ctx.service('tenants').findAll({ parentTenantId: tenant?._id })).results


  // const query: any = { isDeleted: { $ne: true } }
  if (filter_tenantId) {
    query.tenantId = filter_tenantId
  }

  if (!filter_tenantId) {
    query.tenantId = { $in: [tenant?._id, ...subTenants?.map(st => st._id)] }
  }

  const candidates = await ctx.service('candidates').findAll({
    ...query,
    ...pagination
  })

  const candidateIds = candidates.results.map(
    (candidate: any) => candidate._id
  );
  const userIds = candidates.results.map((candidate: any) => candidate.userId);

  let jobApplicationQuery: any = {
    candidateId: { $in: candidateIds },
    tenantId,
  };
  if (parsedQuery.jobId) {
    jobApplicationQuery.jobId = parsedQuery.jobId;
  }
  const appliedJobsOfCandidates = await ctx
    .service("jobApplications")
    .findAll(jobApplicationQuery, {
      select: "_id jobId currentRecruitmentStepId createdAt updatedAt",
      populate: [
        {
          path: "jobId",
        },
        {
          path: "currentRecruitmentStepId",
          select: "_id title color",
        },
      ],
    });
  let filteredCandidates = candidates.results;
  if (parsedQuery.jobId) {
    const filteredCandidateIds = new Set(
      appliedJobsOfCandidates.results.map((job) => job.candidateId.toString())
    );
    filteredCandidates = candidates.results.filter((candidate) =>
      filteredCandidateIds.has(candidate._id.toString())
    );
  }

  const usersRes = await getAllUsersByPopulate(ctx, { populateIds: userIds, select: "name surname email" });

  const users = usersRes.results;

  ctx.body = {
    count: filteredCandidates.length,
    results: filteredCandidates.map((candidate) => {
      const appliedJobs = appliedJobsOfCandidates.results.filter(
        (job) => job.candidateId.toString() === candidate._id.toString()
      );
      const user = users.find(
        (user) => user._id.toString() === candidate.userId.toString()
      );
      return {
        ...candidate.toJSON(),
        applications: appliedJobs,
        user,
      };
    }),
    limit: candidates.limit,
    page: candidates.page,
    totalPage: Math.ceil(filteredCandidates.length / candidates.limit),
  };
}