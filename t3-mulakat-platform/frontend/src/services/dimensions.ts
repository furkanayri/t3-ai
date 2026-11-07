import { tenantApiClient } from 'src/libs/apiClient';

export async function getAllDimensionsService(payload?: string) {
    const res = await tenantApiClient.get(`/bpersonality/dimensions/list${payload ? `?${payload}` : ""}`);
    return res.data;
}

export async function getOneDimensionService({ id }: { id: string }) {
    const res = await tenantApiClient.get(`/bpersonality/dimensions/${id}`);
    return res.data;
}

export async function updateDimensionService({ id, payload }: { id: string; payload: any }) {
    const res = await tenantApiClient.put(`/bpersonality/dimensions/${id}`, payload);
    return res.data;
}

export async function postNewDimensionService(payload: any) {
    const res = await tenantApiClient.post("/bpersonality/dimensions/create", payload);
    return res.data;
}

export async function deleteDimensionService({ id }: { id: string }) {
    const res = await tenantApiClient.delete(`/bpersonality/dimensions/${id}`);
    return res.data;
}

export async function toggleDimensionStatusService({ id }: { id: string }) {
    const res = await tenantApiClient.patch(`/bpersonality/dimensions/${id}/toggle`);
    return res.data;
}