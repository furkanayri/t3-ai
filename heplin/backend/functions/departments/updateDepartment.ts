export default async function updateDepartment(ctx: Context) {
    const { departmentId, tenantId } = ctx.params;

    const department = await ctx.service('departments').updateOne({ _id: departmentId, tenantId }, {
        name: ctx.request.body.name,
        description: ctx.request.body.description,
    });

    ctx.body = { department };
}