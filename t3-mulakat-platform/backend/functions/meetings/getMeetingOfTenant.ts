export default async function getAllJobsOfTenant(ctx: Context) {
    const { tenantId, meetingId } = ctx.params;
    const query = {
        tenantId: tenantId,
        _id: meetingId,
    };
    const meeting = await ctx.service('meetings').findOne(query);
    ctx.body = { meeting };
} 