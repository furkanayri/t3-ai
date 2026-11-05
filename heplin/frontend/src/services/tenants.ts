import { apiClient } from 'src/libs';
import { adminApiClient, tenantApiClient } from 'src/libs/apiClient';
import { CompanyForm, TenantPayload } from 'src/types';

export async function getAllTenants(query?: string) {
  const res = await adminApiClient.get(`/tenants/all?${query || ""}`)

  return res.data
}

export async function getAllParentTenants() {
  const res = await apiClient.get(`/v1/tenants?mainTenants=true`)

  return res.data
}

export async function getTenantInfo({ tenantId }: { tenantId: string }) {
  const res = await apiClient.get(`/v1/tenants/${tenantId}`)

  return res.data
}

export async function createTenantService(payload: TenantPayload) {
  const res = await apiClient.post("/v1/tenants", payload)

  return res.data
}
export async function createTenantCompanyService(payload: TenantPayload) {
  const res = await apiClient.post("/v1/tenants/createTeantForCompany", payload)

  return res.data
}

export async function updateTenantInfo({ id, payload }: { id: string; payload: CompanyForm }) {
  const res = await apiClient.patch(`/v1/tenants/${id}`, payload)

  return res.data
}

export async function getTenantMembers({ tenantId, query }: { tenantId: string, query?: string }) {
  const res = await apiClient.get(`/v1/tenants/${tenantId}/members?populateUser=true&${query || ""}`)

  return res.data
}


export async function inviteTenantMember({ email, tenantId }: { email: string, tenantId: string, }) {
  const res = await apiClient.post(`/v1/tenants/${tenantId}/members`, {
    email,
  })

  return res.data
}

export async function inviteResend({ tenantId, email }: { tenantId: string, email: string }) {
  const res = await apiClient.post(`/v1/tenants/${tenantId}/members/resend`, {
    email,
  })

  return res.data
}

export async function revokeTenantMember({ tenantMemberId, tenantId }: { tenantMemberId: string, tenantId: string }) {
  const res = await apiClient.delete(`/v1/tenants/${tenantId}/members/${tenantMemberId}`,)


  return res.data
}

export async function changeStatusTenantMember({ tenantId, userId, payload }: { tenantId: string, userId: string, payload: any }) {
  const res = await apiClient.patch(`/v1/admin/${tenantId}/users/${userId}`, payload)

  return res.data
}

export async function changeStatusTenant({ tenantId, payload, selectedTenantId }: { tenantId: string, payload: any, selectedTenantId: string }) {
  const res = await apiClient.patch(`/v1/admin/${tenantId}/tenants/${selectedTenantId}`, payload)

  return res.data
}

export async function changeStatusTeamMember({ tenantId, memberId, payload }: { tenantId: string, memberId: string, payload: any, }) {
  const res = await apiClient.patch(`/v1/tenants/${tenantId}/members/${memberId}`, payload)

  return res.data
}
export async function tenantQrService({ payload }: { payload: { url: string }, }) {
  const res = await tenantApiClient.patch(`qr`, payload)

  return res.data
}