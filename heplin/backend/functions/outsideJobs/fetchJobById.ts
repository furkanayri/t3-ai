import { getAllTenantsByPopulate } from "@/utils/populate/getAllTenantsByPopulate";

export default async function getJobById(ctx: Context) {
    const { id } = ctx.params;
    const job = await ctx.service('jobs').findById(id);

    const tenant = await getAllTenantsByPopulate(ctx, {
        populateIds: job.tenantId
    });
    
    ctx.body = {
        job: {
            ...job.toObject(),
            tenantId: tenant.results?.[0]
        }
    };
}; 