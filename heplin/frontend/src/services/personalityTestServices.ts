import { apiClient } from 'src/libs';

// POST /api/v1/personality-test/start
export async function startPersonalityTest(payload: any) {
    const response = await apiClient.post('/v1/personality-test/start', payload);
    return response.data;
}

// POST /api/v1/personality-test/sessions/:sessionId/answer
export async function submitAnswer(sessionId: string, payload: any) {
    const response = await apiClient.post(`/v1/personality-test/sessions/${sessionId}/answer`, payload);
    return response.data;
}

// GET /api/v1/personality-test/sessions/:sessionId/current-question
export async function getCurrentQuestion(sessionId: string) {
    const response = await apiClient.get(`/v1/personality-test/sessions/${sessionId}/current-question`);
    return response.data;
}
export async function checkEligibility() {
    const response = await apiClient.get('/v1/personality-test/check-eligibility');
    return response.data;
}