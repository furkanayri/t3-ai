import { tenantApiClient } from "src/libs/apiClient";

export async function getAllEmailTemplates(query?: string) {
    const res = await tenantApiClient.get(`/emailTemplates?${query || ""}`);
    return res.data;
}
export async function getEmailTemplate(id: string) {
    const res = await tenantApiClient.get(`/emailTemplates/${id}`);
    return res.data;

}
export async function createEmailTemplate(payload: any) {
    const res = await tenantApiClient.post(`/emailTemplates`, payload);
    return res.data;

}
export async function updateEmailTemplate(payload: { id: string, data: any }) {
    const res = await tenantApiClient.patch(`/emailTemplates/${payload.id}`, payload.data);
    return res.data;
}
export async function deleteEmailTemplate(id: string) {
    const res = await tenantApiClient.delete(`/emailTemplates/${id}`);
    return res.data;
}
