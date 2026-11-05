import { adminApiClient, tenantApiClient } from "src/libs/apiClient";

export async function getAllCandidatesService({ query }: { query?: string }) {
    const res = await adminApiClient.get(`/candidates?${query || ''}`)
    return res.data
}
export async function getCandidateByIdService({ candidateId }: { candidateId: string }) {
    const res = await tenantApiClient.get(`admin/candidates/${candidateId}`)
    return res.data
}