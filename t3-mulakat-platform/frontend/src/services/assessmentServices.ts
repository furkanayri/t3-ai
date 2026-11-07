import apiClient, { tenantApiClient } from "src/libs/apiClient";

// ---- Admin / tenant tarafi ----
export async function getAssessmentProcessesService() {
    const res = await tenantApiClient.get(`/assessment-processes`);
    return res.data;
}

export async function createAssessmentProcessService(payload: { title: string; description?: string; sequential?: boolean }) {
    const res = await tenantApiClient.post(`/assessment-processes`, payload);
    return res.data;
}

export async function getAssessmentProcessService({ processId }: { processId: string }) {
    const res = await tenantApiClient.get(`/assessment-processes/${processId}`);
    return res.data;
}

export async function updateAssessmentProcessService({ processId, payload }: { processId: string; payload: any }) {
    const res = await tenantApiClient.patch(`/assessment-processes/${processId}`, payload);
    return res.data;
}

export async function deleteAssessmentProcessService({ processId }: { processId: string }) {
    const res = await tenantApiClient.delete(`/assessment-processes/${processId}`);
    return res.data;
}

export async function createAssessmentStageService({ processId, payload }: { processId: string; payload: any }) {
    const res = await tenantApiClient.post(`/assessment-processes/${processId}/stages`, payload);
    return res.data;
}

export async function updateAssessmentStageService({ processId, stageId, payload }: { processId: string; stageId: string; payload: any }) {
    const res = await tenantApiClient.patch(`/assessment-processes/${processId}/stages/${stageId}`, payload);
    return res.data;
}

export async function deleteAssessmentStageService({ processId, stageId }: { processId: string; stageId: string }) {
    const res = await tenantApiClient.delete(`/assessment-processes/${processId}/stages/${stageId}`);
    return res.data;
}

export async function reorderAssessmentStagesService({ processId, stagesSort }: { processId: string; stagesSort: string[] }) {
    const res = await tenantApiClient.patch(`/assessment-processes/${processId}/stages/reorder`, { stagesSort });
    return res.data;
}

export async function assignAssessmentProcessService({ processId, userIds, dueDate }: { processId: string; userIds: string[]; dueDate?: string }) {
    const res = await tenantApiClient.post(`/assessment-processes/${processId}/assign`, { userIds, dueDate });
    return res.data;
}

// ---- Aday tarafi ----
export async function getMyAssessmentsService() {
    const res = await apiClient.get(`/v1/my-assessments`);
    return res.data;
}

export async function getMyAssessmentService({ assignmentId }: { assignmentId?: string } = {}) {
    const res = await apiClient.get(`/v1/my-assessment`, { params: assignmentId ? { assignmentId } : undefined });
    return res.data;
}

export async function startAssessmentStageService({ assignmentId, stageId }: { assignmentId: string; stageId: string }) {
    const res = await apiClient.post(`/v1/assessment-assignments/${assignmentId}/stages/${stageId}/start`);
    return res.data;
}
