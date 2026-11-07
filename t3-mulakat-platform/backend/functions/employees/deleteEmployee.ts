export default async function deleteEmployee(ctx: Context) {
    const { tenantId, employeeId } = ctx.params;
    const { user } = ctx.state;

    const employee = await ctx.service('employees').softDelete({
        tenantId,
        _id: employeeId,
    }, user?._id);

    ctx.body = { employee };
}