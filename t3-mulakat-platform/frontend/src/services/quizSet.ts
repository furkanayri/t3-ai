import { tenantApiClient } from 'src/libs/apiClient';

// GET /api/v1/tenants/:tenantId/quiz-sets - Tüm quiz setleri listeleme
export async function getAllQuizSetsService(payload?: string) {
    const res = await tenantApiClient.get(`/quiz-sets${payload ? `?${payload}` : ''}`);
    return res.data;
}

// POST /api/v1/tenants/:tenantId/quiz-sets - Yeni quiz set oluşturma
export async function createQuizSetService(payload: any) {
    const res = await tenantApiClient.post('/quiz-sets', payload);
    return res.data;
}

// GET /api/v1/tenants/:tenantId/quiz-sets/:quizSetId - Quiz set detayı
export async function getQuizSetDetailService({ quizSetId }: { quizSetId: string }) {
    const res = await tenantApiClient.get(`/quiz-sets/${quizSetId}`);
    return res.data;
}

// PUT /api/v1/tenants/:tenantId/quiz-sets/:quizSetId - Quiz set güncelleme
export async function updateQuizSetService({ quizSetId, payload }: { quizSetId: string; payload: any }) {
    const res = await tenantApiClient.put(`/quiz-sets/${quizSetId}`, payload);
    return res.data;
}

// DELETE /api/v1/tenants/:tenantId/quiz-sets/:quizSetId - Quiz set silme
export async function deleteQuizSetService({ quizSetId }: { quizSetId: string }) {
    const res = await tenantApiClient.delete(`/quiz-sets/${quizSetId}`);
    return res.data;
}

// PATCH /api/v1/tenants/:tenantId/quiz-sets/:quizSetId/toggle - Aktif/pasif yapma
export async function toggleQuizSetService({ quizSetId }: { quizSetId: string }) {
    const res = await tenantApiClient.patch(`/quiz-sets/${quizSetId}/toggle`);
    return res.data;
}
