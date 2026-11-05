export default async function getDepartment(ctx: Context) {
    const { departmentId, tenantId } = ctx.params;
    const department = await ctx.service('departments').findOne({ _id: departmentId, tenantId });
    ctx.body = department
}