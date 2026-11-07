import { tenantApiClient } from "src/libs/apiClient";

export async function getTenantQuota() {
    const res = await tenantApiClient.get("/quota")
    return res.data
}