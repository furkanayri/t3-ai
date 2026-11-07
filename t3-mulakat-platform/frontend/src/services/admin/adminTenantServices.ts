import { adminApiClient } from "../../libs/apiClient"

export async function getAllEmployeesOfTenant(tenantId: string) {
    const res = await adminApiClient.get(`/tenants/${tenantId}/employees`)
    return res.data
}