import { ITenantUsageQuote } from "@/types/entities";
import { array } from "@/utils";
import { Types } from "mongoose"

export default async function spendCreditOfTenant(ctx: Context) {
    const res = await spendCreditOfTenantFnc(ctx, ctx.request.body)
    ctx.status = res.status
    ctx.body = {
        isSuccess: res.isSuccess,
        message: res.message
    }
}

export async function spendCreditOfTenantFnc(ctx: Context, options: any) {
    
    const tenantId = ctx.params.tenantId;

    const { credit, type, taskType, sender, recipient } = options;

    const response = {status: 200, message: "Credit spent successfully", isSuccess: true}

    if (!credit || !type) {
        response.status = 400
        response.message = "Credit and type are required"
        response.isSuccess = false
        return response
    }

    if (!["sms", "email"].includes(type)) {
        response.status = 400;
        response.message = "Type should be either sms or email"
        return response;
    }

    if (!Number.isInteger(credit)) {
        response.status = 400;
        response.message= "Credit should be an integer"
        return response;
    }

    if (credit <= 0) {
        response.status = 400;
        response.message = "Credit should be greater than 0"
        return response;
    }

    const filter: any = {
        _id: tenantId,
        "usageQuotes.type": type,
        $or: [
            {
                "usageQuotes.remainingFreeCredit.credit": {
                    $gte: credit
                },
            },
            {
                "usageQuotes.remainingPurchasedCredit.credit": {
                    $gte: credit
                },
            }
        ]
    }

    const tenant = await ctx.service("tenants").findOne(filter);

    if (!tenant) {
        response.status = 404;
        response.message = "Tenant not found or tenant does not have any credit"
        return response;
    }

    const usageQuotes = array<ITenantUsageQuote>(tenant?.usageQuotes)

    const usageQuoteIndex = usageQuotes.findIndex((quote: any) => quote.type === type && (quote.remainingFreeCredit.credit > 0 || quote.remainingPurchasedCredit.credit > 0));

    if (usageQuoteIndex === -1) {
        response.status = 404;
        response.message = "Tenant does not have any credit"
        return response;
    }

    const usageQuote = usageQuotes[usageQuoteIndex];

    if (usageQuote?.remainingFreeCredit?.credit > 0) {
        usageQuote.remainingFreeCredit.credit -= credit;
    } else {
        usageQuote.remainingPurchasedCredit.credit -= credit;
    }

    usageQuote.remainingTotalCredit.credit -= credit;

    if (usageQuote.remainingTotalCredit.credit < 0) {
        response.status = 400;
        response.message = "Insufficient credit"
        return response;
    }

    console.log({ tenantId })
    await ctx.service("tenants").updateOne({ _id: tenantId }, {
        "usageQuotes": usageQuotes
    })

    await ctx.service("tenantUsageQuoteLogs").create({
        tenantId: new Types.ObjectId(tenantId.toString()),
        credit,
        type,
        taskType,
        recipient,
        sender
    })

        response.isSuccess = true,
        response.message = "Credit spent successfully"
        return response;
}