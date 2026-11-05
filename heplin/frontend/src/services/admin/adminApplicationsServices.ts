import { adminApiClient } from "src/libs/apiClient";

export async function getAllJobApplicationsService(query?: string) {
    const res = await adminApiClient.get(`/applications?${query || ''}`)
    return res.data;
}
