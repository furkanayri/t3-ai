import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";

export default async function getAllCandidatesOfAdminTenant(ctx: Context) {
    const token = ctx.request.headers.authorization?.replace(`Bearer `, "") || ctx.cookies.get('token'); // Get token from cookies
    const { adminTenantId } = ctx.params
    const { page, limit } = ctx.query;

    const tenant = await ctx.service('tenants').findById(adminTenantId)
    if (!tenant) ctx.throw(401, "Tenant not found")
    const subTenants = (await ctx.service('tenants').findAll({ parentTenantId: tenant?._id })).results

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const { tenantId } = ctx.request.query
    const query: any = {}

    if (!tenantId) {
        query.tenantId = { $in: [tenant?._id, ...subTenants?.map(st => st?._id)] }
    }
    if (tenantId) {
        query.tenantId = tenantId
    }


    const candidates = await ctx.service('candidates').findAll({
        ...query,
        ...pagination,
    })

    if (!candidates.results.length) {
        console.log("no candidates found")
        ctx.body = candidates
        return ctx.stop()
    }
    const userIds = candidates?.results?.map((candidate: any) => candidate.userId)
    // if(userIds.length === 0) ctx.throw(404, "Candidate not found")

    const usersRes = await getAllUsersByPopulate(ctx, { populateIds: userIds, select: "name surname email" });

    const users = usersRes?.results;
    const uniqueCandidates = candidates.results.reduce((acc, current) => {
        const selectedUser = acc.find(item => item.userId.toString() === current.userId.toString());
        if (!selectedUser) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);
    ctx.body = {
        ...candidates,
        results: uniqueCandidates.map(candidate => {
            const candidateUser = users?.find(u => u._id.toString() === candidate.userId.toString())

            return {
                ...candidate.toJSON(),
                candidateUser
            }
        })
    }

}
