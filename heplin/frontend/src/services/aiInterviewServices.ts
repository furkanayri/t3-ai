import { apiClient } from "src/libs"
import { tenantApiClient } from "src/libs/apiClient"

//candidate
export async function getAllMyInterviewsAnswersService() {
    const res = await apiClient.get(`/v1/interviews`)
    return res.data
}
export async function getInterviewAnswersDetailService({ id }: { id: string }) {
    const res = await apiClient.get(`/v1/interviews/${id}`)
    return res.data
}
export async function updateInterviewAnswersService({ id, payload }: { id: string, payload: any, query?: any }) {
    const res = await apiClient.patch(`/v1/interviews/${id}`, payload)
    return res.data
}

// Chat
export async function getInterviewChatService({ id }: { id: string }) {
    const res = await apiClient.get(`/v1/interviews/chat/${id}`)
    return res.data
}
export async function updateInterviewChatService({ id, payload }: { id: string, payload: any }) {
    const res = await apiClient.patch(`/v1/interviews/chat/${id}`, payload)
    return res.data
}

// Evaluate

export async function updateInterviewevaluateService({ id }: { id: string }) {
    const res = await apiClient.patch(`/v1/interviews/evaluate/${id}`)
    return res.data
}


//company
export async function getAiInterviewsByJobId({ jobId }: { jobId: string }) {
    const res = await tenantApiClient.get(`/interviews/${jobId}`)
    return res.data
}
export async function updateAiInterviewService({ jobId, payload }: { jobId: string, payload: any }) {
    const res = await tenantApiClient.patch(`/interviews/${jobId}`, payload)
    return res.data
}
export async function getAiInterviewAnswersByJobId({ interviewAnswerId, applicantId }: { interviewAnswerId: string, applicantId: string }) {
    const res = await tenantApiClient.get(`/interviewsAnswers/${interviewAnswerId}/applicant/${applicantId}`)
    return res.data
}
export async function getAiInterviewAnswersGetAll({ interviewAnswerId, applicantId }: { interviewAnswerId: string, applicantId: string }) {
    const res = await tenantApiClient.get(`/interviewsAnswers/${interviewAnswerId}/applicant/${applicantId}/getAll`)
    return res.data
}

// interviewInvitation
export async function createInterviewInvitation({ jobId, applicationId }: { jobId: string, applicationId: string }) {
    const res = await tenantApiClient.post(`/aiInvitation/jobs/${jobId}/jobApplication/${applicationId}`)
    return res.data
}