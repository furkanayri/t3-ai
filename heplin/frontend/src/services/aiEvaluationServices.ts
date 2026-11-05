import apiClient, { tenantApiClient } from "src/libs/apiClient";

export async function aiEvaluationCreateService({ fileKey, payload }: { fileKey: string, payload: any }) {
    const res = await tenantApiClient.post(`aievaluation/${fileKey}`, payload);

    return res.data
}
export async function aiArchiveEvaluationCreateService({ fileKey, payload }: { fileKey: string, payload: any }) {
    const res = await tenantApiClient.post(`archiveAievaluation/${fileKey}`, payload);

    return res.data
}
export async function autoFill(cvId: string) {
    const res = await apiClient.post(`v1/candidate/autoFill/${cvId}`);
    return res.data
}
export async function getAiEvaluation({ candidateId, jobId }: { candidateId: string, jobId: string }) {
    const res = await tenantApiClient.get(`aievaluation/candidate/${candidateId}/job/${jobId}`);
    return res.data
}
export async function archiveGetAiEvaluation({ candidateId, jobId }: { candidateId: string, jobId: string }) {
    const res = await tenantApiClient.get(`archiveAievaluation/candidate/${candidateId}/job/${jobId}`);
    return res.data
}
