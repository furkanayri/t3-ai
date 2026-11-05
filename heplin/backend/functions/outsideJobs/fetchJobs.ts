import { getAllTenantsByPopulate } from "@/utils/populate/getAllTenantsByPopulate";
import { Types } from "mongoose";

export default async function getAllApplicationsOfUser(ctx: Context) {
  let { locationType, jobType, search, city } = ctx.query;

  const query: any = {
    isDeleted: { $ne: true },
  };

  if (locationType && locationType !== "all") {
    if (typeof locationType === "string") {
      locationType = locationType.split(",");
    }
    query.locationType = { $in: locationType };
  }

  if (jobType) {
    if (typeof jobType === "string") {
      jobType = jobType.split(",");
    }
    query.jobType = { $in: jobType };
  }
  if (city) {
    if (typeof city === "string") {
      city = city.split(",");
    }
    query.city = { $in: city };
  }

  if (search) {
    query.title = { $regex: search, $options: "i" }; // "i" seçeneği büyük küçük harf duyarsızlığı sağlar
  }

  const jobApplications = await ctx.service("jobs").findAll(query);

  const tenantIds = jobApplications.results.map(
    (jobApplication) => jobApplication?.tenantId
  );

  const tenants = await getAllTenantsByPopulate(ctx, {
    populateIds: tenantIds,
    select: "name logo _id",
  });

  const tenantMap = tenants.results?.reduce((acc, tenant) => {
    if (!tenant._id || (typeof tenant._id !== 'string' && !(tenant._id instanceof Types.ObjectId)))
      ctx.throw(404, "Invalid tenant id");
    acc[tenant._id.toString()] = tenant;
    return acc;
  }, {});

  jobApplications.results = jobApplications.results.map((jobApplication) => {
    jobApplication.tenantId = tenantMap[jobApplication.tenantId.toString()];
    return jobApplication;
  });

  ctx.body = {
    results: jobApplications.results.map((jobApplication) => {
      return {
        ...jobApplication.toObject(),
        tenantId: tenantMap[jobApplication.tenantId.toString()],
      };
    }),
    count: jobApplications.count,
    limit: jobApplications.limit,
    page: jobApplications.page,
    totalPage: jobApplications.totalPage,
  };
}
