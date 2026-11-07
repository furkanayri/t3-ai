export default async function getEmployee(ctx: Context) {
    const { employeeId, tenantId } = ctx.params;
    const employee = await ctx.service('employees').findOne({ _id: employeeId, tenantId });
    ctx.body = employee
}