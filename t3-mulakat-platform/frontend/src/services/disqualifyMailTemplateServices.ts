import { tenantApiClient } from "src/libs/apiClient";


export async function getDisqualifyTenantMail(query?: string) {
    const res = await tenantApiClient.get(`/disqualifyEmailTemplates?${query || ""}`);
    return res.data;
}

export async function createDisqualifyEmailTemplate(payload: any) {
    const res = await tenantApiClient.post(`/disqualifyEmailTemplates`, payload);
    return res.data;

}
export async function updateDisqualifyEmailTemplate(payload: { id: string, data: any }) {
    const res = await tenantApiClient.patch(`/disqualifyEmailTemplates/${payload.id}`, payload.data);
    return res.data;
}
export async function deleteDisqualifyEmailTemplate(id: string) {
    const res = await tenantApiClient.delete(`/disqualifyEmailTemplates/${id}`);
    return res.data;
}


