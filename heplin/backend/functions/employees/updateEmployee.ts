export default async function updateEmployee(ctx: Context) {
    const { employeeId, tenantId } = ctx.params;

    delete ctx.request.body?.userId;
    delete ctx.request.body?.tenantId;
    console.log('ctx.request.body', ctx.request.body, employeeId, tenantId);
    
    const employee = await ctx.service('employees').updateOne({ _id: employeeId, tenantId }, ctx.request.body);

    ctx.body = { employee };
}