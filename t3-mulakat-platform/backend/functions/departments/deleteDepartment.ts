export default async function getAllDepartmentsOfTenant(ctx: Context) {
    const { tenantId, departmentId } = ctx.params;
    const { user } = ctx.state;

    const departments = await ctx.service('departments').softDelete({
        tenantId,
        _id: departmentId,
    }, user?._id);
    ctx.body = { departments };
}