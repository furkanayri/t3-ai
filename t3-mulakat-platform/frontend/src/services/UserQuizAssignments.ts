import { apiClient, tenantApiClient } from "src/libs/apiClient";

// Quiz atama için payload tipleri
export interface CreateQuizAssignmentPayload {
    userId: string;
    quizSetId: string; // Backend'de quizSetId bekleniyor
    dueDate?: string;
    note?: string;
}

export interface UpdateQuizAssignmentPayload {
    dueDate?: string;
    note?: string;
    status?: string;
}

// POST /api/v1/tenants/:tenantId/quiz-assignments - Kullanıcıya quiz ata
export async function createQuizAssignmentService(payload: CreateQuizAssignmentPayload) {
    const res = await tenantApiClient.post('/quiz-assignments', payload);
    return res.data;
}

// GET /api/v1/tenants/:tenantId/quiz-assignments - Tüm atamaları listele (Admin)
export async function getAllQuizAssignmentsService(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
}) {
    const res = await tenantApiClient.get('/quiz-assignments', { params });
    return res.data;
}

// GET /api/v1/tenants/:tenantId/users/:userId/quiz-assignments - Kullanıcının atamaları
export async function getUserQuizAssignmentsService(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const res = await tenantApiClient.get(`/users/${userId}/quiz-assignments`, { params });
    return res.data;
}

// GET /api/v1/tenants/:tenantId/quiz-assignments/:assignmentId - Atama detayı
export async function getQuizAssignmentDetailService(assignmentId: string) {
    const res = await tenantApiClient.get(`/quiz-assignments/${assignmentId}`);
    return res.data;
}

// POST /api/v1/tenants/:tenantId/quiz-assignments/:assignmentId/start - Quiz başlat
export async function startQuizAssignmentService(assignmentId: string) {
    const res = await tenantApiClient.post(`/quiz-assignments/${assignmentId}/start`);
    return res.data;
}

// PATCH /api/v1/tenants/:tenantId/quiz-assignments/:assignmentId - Atama güncelle
export async function updateQuizAssignmentService(
    assignmentId: string,
    payload: UpdateQuizAssignmentPayload
) {
    const res = await tenantApiClient.patch(`/quiz-assignments/${assignmentId}`, payload);
    return res.data;
}

// DELETE /api/v1/tenants/:tenantId/quiz-assignments/:assignmentId - Atama sil
export async function deleteQuizAssignmentService(assignmentId: string) {
    const res = await tenantApiClient.delete(`/quiz-assignments/${assignmentId}`);
    return res.data;
}

// ============ ACCOUNTS APP (Candidate) API'leri ============

// GET /api/v1/candidate/quiz-assignments - Candidate'ın kendi atamaları
export async function getCandidateQuizAssignmentsService(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const res = await apiClient.get('/v1/candidate/quiz-assignments', { params });
    return res.data;
}

// POST /api/v1/candidate/quiz-assignments/:assignmentId/start - Candidate quiz başlat
export async function startCandidateQuizAssignmentService(assignmentId: string) {
    const res = await apiClient.post(`/v1/candidate/quiz-assignments/${assignmentId}/start`);
    return res.data;
}
