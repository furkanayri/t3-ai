import { isNullish } from "@/utils";
import { qrGenerator } from "@/utils/qrCode/qrGenerator";

export default async function tenantQr(ctx: Context) {
    const body = ctx.request.body;
    const qr = await qrGenerator(body.url)
    const response = await ctx.service("tenants").update(ctx.params.tenantId, { tenantQr: qr });

    ctx.body = { isSuccess: true };
}