import { apiClient } from "src/libs";

export async function getTenantUserOfPermissionsService({ memberId, tenantId, }: { memberId: string; tenantId: string; }) {
  const res = await apiClient.get(
    `/v1/tenants/${tenantId}/members/${memberId}/permissions`
  );

  return res.data;
}

export async function updateUserPermissionsService(payload: { memberId: string; permissions: { scope: string; allowed: boolean }[]; tenantId: string; }) {
  const res = await apiClient.post(
    `/v1/tenants/${payload.tenantId}/members/${payload.memberId}/permissions`,
    {
      permissions: payload.permissions,
    }
  );

  return res.data;
}
