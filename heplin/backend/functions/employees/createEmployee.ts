import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";

export default async function createEmployee(ctx: Context) {
    const payload = { ...ctx.request.body, tenantId: ctx.params.tenantId }

    const userRes = await getAllUsersByPopulate(ctx, {
        populateIds: [ctx.request.body?.userId],
        select: "_id name surname email"
    });

    const userData = userRes?.results?.[0]

    if (!userData) return ctx.throw(404, "Not found any associated the user");

    const isExistEmployee = await ctx.service("employees").findOne({
        tenantId: ctx.params.tenantId,
        userId: ctx.request.body?.userId
    })

    if (isExistEmployee) return ctx.throw(409, "This user has already been added as an employee!")

    payload.name = userData?.name;
    payload.surname = userData?.surname;
    payload.email = userData?.email;
    payload.avatar = userData?.avatar;
    const employee = await ctx.service('employees').create(payload);
    ctx.body = { employee };
}