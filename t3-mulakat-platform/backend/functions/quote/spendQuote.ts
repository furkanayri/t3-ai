import { spendCreditOfTenantFnc } from "../tenants/credits/spendCreditOfTenant";

export default async function spendQuote(ctx: Context, options: any) {
    const { sender, recipient } = ctx.state

    const res = await spendCreditOfTenantFnc(ctx, {
        credit: options?.credit || 1,
        type: options?.type,
        taskType: options?.taskType,
        sender,
        recipient
    });

    if (res?.isSuccess !== true) {
        return ctx.throw(400, "Error spending quote")
    }

    ctx.body = {
        isSuccess: true,
    }
} 