import { hasCreditOfTenantFnc } from "../tenants/credits/hasCreditOfTenant";

export default async function checkQuote(ctx: Context, options: any) {
    const res = await hasCreditOfTenantFnc(ctx, { credit: options?.credit || 1, type: options?.type })

    if (res?.hasCredit !== true) {
        return ctx.throw(400, "Have not any credit")
    }
}
