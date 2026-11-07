import { isNullish } from "@/utils";

export default async function updateOneTenant(ctx: Context) {
    const body = ctx.request.body;

    if (!isNullish(body.subdomain)) {
        delete body.subdomain;
    }

    const response = await ctx.service("tenants").update(ctx.params.tenantId, body, { new: true });

    ctx.body = {
        tenant: response,
    };
}