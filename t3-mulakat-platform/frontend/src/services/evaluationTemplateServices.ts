import { tenantApiClient } from "src/libs/apiClient"
import { CandidateEvaluationPayload } from "src/types"
import { EvaluationTemplatePayload } from "src/types/EvaluationTemplate"

export async function getAllEvaluationTemplatesService(query?: string) {
    const res = await tenantApiClient.get(`/evaluationTemplates?${query || ""}`)

    return res.data
}

export async function getOneEvaluationTemplateService(id: string) {
    const res = await tenantApiClient.get(`/evaluationTemplates/${id}`)

    return res.data
}

export async function createEvaluationTemplateService(payload: EvaluationTemplatePayload) {
    const res = await tenantApiClient.post('/evaluationTemplates', payload)
    return res.data

}
export async function createEvaluationCandidateTemplateMutation({ candidateId, payload }: { candidateId: string, payload: CandidateEvaluationPayload }) {
    const res = await tenantApiClient.post(`/candidates/${candidateId}/evaluations`, payload)
    return res.data

}

export async function updateEvaluationTemplateService({ id, payload }: { id: string, payload: EvaluationTemplatePayload }) {
    const res = await tenantApiClient.patch(`/evaluationTemplates/${id}`, payload)

    return res.data
}

export async function deleteEvaluationTemplateService(id: string) {
    const res = await tenantApiClient.delete(`/evaluationTemplates/${id}`)

    return res.data
}