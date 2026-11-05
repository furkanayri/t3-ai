import { tenantApiClient } from 'src/libs/apiClient';

export async function getAllInterviewQuestionsService(payload?: string) {
    const res = await tenantApiClient.get(`/bpersonality/interviewQuestions/list${payload ? `?${payload}` : ""}`);
    return res.data;
}

export async function getOneInterviewQuestionService({ id }: { id: string }) {
    const res = await tenantApiClient.get(`/bpersonality/interviewQuestions/${id}`);
    return res.data;
}

export async function updateInterviewQuestionService({ id, payload }: { id: string; payload: any }) {
    const res = await tenantApiClient.put(`/bpersonality/interviewQuestions/${id}`, payload);
    return res.data;
}

export async function postNewInterviewQuestionService(payload: any) {
    const res = await tenantApiClient.post("/bpersonality/interviewQuestions/create", payload);
    return res.data;
}

export async function deleteInterviewQuestionService({ id }: { id: string }) {
    const res = await tenantApiClient.delete(`/bpersonality/interviewQuestions/${id}`);
    return res.data;
}

export async function toggleInterviewQuestionStatusService({ id }: { id: string }) {
    const res = await tenantApiClient.patch(`/bpersonality/interviewQuestions/${id}/toggle`);
    return res.data;
}
