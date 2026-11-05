import { tenantApiClient } from 'src/libs/apiClient';
import { Department } from 'src/types';

export async function createCandidateEvaluation(payload: { candidateId: string, content: any }) {
    const res = await tenantApiClient.post(`/candidates/${payload.candidateId}/evaluations`, payload.content)
    return res.data
}

// export async function updateCandidateEvaluation({ candidatesId, evaluationId }: { candidatesId: string, evaluationId: string }) {
//     const res = await tenantApiClient.patch(`/candidates/${candidatesId}/evaluations/${evaluationId}`)
//     return res.data
// }

// export async function deleteCandidateEvaluation({ candidatesId, evaluationId }: { candidatesId: string, evaluationId: string }) {
//     const res = await tenantApiClient.delete(`/candidates/${candidatesId}/evaluations/${evaluationId}`)
//     return res.data
// }

export async function getCandidateEvaluations({ candidateId, query }: { candidateId: string, query: string }) {
    const res = await tenantApiClient.get(`/candidates/${candidateId}/evaluations?${query}`)
    return res.data
}

// export async function getOneCandidateEvaluation({ candidatesId, evaluationId }: { candidatesId: string, evaluationId: string }) {
//     const res = await tenantApiClient.get(`/candidates/${candidatesId}/evaluations/${evaluationId}`)
//     return res.data
// }