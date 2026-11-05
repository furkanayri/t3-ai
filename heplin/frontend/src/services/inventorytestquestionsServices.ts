import { tenantApiClient } from 'src/libs/apiClient';

// Get all test questions
export async function getAllTestQuestionsService(payload?: string) {
    const res = await tenantApiClient.get(`/bpersonality/testQuestions/list${payload ? `?${payload}` : ""}`);
    return res.data;
}

// Add question to test
export async function addTestQuestionService(payload: any) {
    const res = await tenantApiClient.post("/bpersonality/testQuestions/add", payload);
    return res.data;
}

// Remove question from test
export async function removeTestQuestionService({ testQuestionId }: { testQuestionId: string }) {
    const res = await tenantApiClient.delete(`/bpersonality/testQuestions/${testQuestionId}`);
    return res.data;
}