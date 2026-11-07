import { tenantApiClient } from 'src/libs/apiClient';

// Get all personality tests
export async function getAllPersonalityTestsService(payload?: string) {
    const res = await tenantApiClient.get(`/bpersonality/tests/list${payload ? `?${payload}` : ""}`);
    return res.data;
}

// Get single personality test by ID
export async function getOnePersonalityTestService({ id }: { id: string }) {
    const res = await tenantApiClient.get(`/bpersonality/tests/${id}`);
    return res.data;
}

// Create new personality test
export async function postNewPersonalityTestService(payload: any) {
    const res = await tenantApiClient.post("/bpersonality/tests/create", payload);
    return res.data;
}

// Update existing personality test
export async function updatePersonalityTestService({ id, payload }: { id: string; payload: any }) {
    const res = await tenantApiClient.put(`/bpersonality/tests/${id}`, payload);
    return res.data;
}

// Delete personality test
export async function deletePersonalityTestService({ id }: { id: string }) {
    const res = await tenantApiClient.delete(`/bpersonality/tests/${id}`);
    return res.data;
}

// Toggle personality test status (active/inactive)
export async function togglePersonalityTestStatusService({ id }: { id: string }) {
    const res = await tenantApiClient.patch(`/bpersonality/tests/${id}/toggle`);
    return res.data;
}