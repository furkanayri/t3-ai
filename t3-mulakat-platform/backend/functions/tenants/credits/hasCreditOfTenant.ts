export default async function hasCreditOfTenant(ctx: Context, options: any) {
    return await hasCreditOfTenantFnc(ctx, options)
}

export async function hasCreditOfTenantFnc(ctx: Context, options: any) {
    const tenantId = ctx.params.tenantId;

    const { type } = options;
    const filter: any = {
        _id: tenantId,
        "usageQuotes.type": type,
        $or: [
            {
                "usageQuotes.remainingFreeCredit.credit": {
                    $gt: 0
                },
            },
            {
                "usageQuotes.remainingPurchasedCredit.credit": {
                    $gt: 0
                },
            }
        ]
    }

    const response = await ctx.service("tenants").findOne(filter);

    console.log({ response })

    return {
        hasCredit: response ? true : false
    }
}

