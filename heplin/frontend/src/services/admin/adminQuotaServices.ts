import { adminApiClient } from "src/libs/apiClient";
import { Quotas } from "src/types/Quotas";

export async function getTenantQuotaForAdmin(tenantId: string) {
    const res = await adminApiClient.get(`/tenants/${tenantId}/quotas`)
    return res.data;

}
export async function updateTenantQuotaForAdmin({ tenantId, payload }: { tenantId: string, payload: Quotas }) {
    const res = await adminApiClient.patch(`/tenants/${tenantId}/quotas`, payload)
    return res.data;

}