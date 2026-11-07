import apiClient, { adminApiClient } from "src/libs/apiClient";
import { JobApplicantQuestionForm, JobForm, JobFormFields, JobGeneralInfoForm, JobSkillsForm } from "src/types/jobPost";

export async function getAllJobsOfAdminTenantService(query?: string) {
    const res = await adminApiClient.get(`/jobs?${query || ""}`);
    return res.data;
}

export async function getJobDetailService({ jobId }: { jobId: string, }) {
    const res = await adminApiClient.get(`/jobs/${jobId}`)
    return res.data;

}
export async function updateJob({ payload, jobId }: { jobId: string, payload: any }) {
    const res = await adminApiClient.patch(`/jobs/${jobId}`, payload)
    return res.data;

}

export async function postNewJobService({ tenantId, payload }: { tenantId: string, payload: JobForm }) {
    const res = await adminApiClient.post(`tenants/${tenantId}/jobs`, payload);

    return res.data
}

export async function getJobApplicationsOfJobService({ jobId, query }: { jobId: string, query?: string }) {
    const res = await adminApiClient.get(`/jobs/${jobId}/applications?${query || ""}`);
    return res.data;
}

export async function createJobApplicationService({ payload }: { payload: any }) {
    const res = await adminApiClient.post(`/applications`, payload);

    return res.data
}

export async function updateGeneralInfoJobService({ jobId, payload }: { jobId: string; payload: JobGeneralInfoForm, }) {
    const res = await adminApiClient.patch(`/jobs/${jobId}`, payload);

    return res.data
}

export async function getAllRecruitmentStagesOfTenantService(tenantId: string, query?: string) {
    const res = await adminApiClient.get(`/tenants/${tenantId}/recruitmentStages?${query || ""}`);

    return res.data;
}


export async function updateJobApplicantQuestonsService({ jobId, payload }: { jobId: string; payload: JobApplicantQuestionForm, }) {
    const res = await adminApiClient.patch(`/jobs/${jobId}`, payload);

    return res.data
}


export async function updateFormFieldsJobService({ jobId, payload }: { jobId: string; payload: JobFormFields, }) {
    const res = await adminApiClient.patch(`/jobs/${jobId}`, payload);

    return res.data
}


export async function updateJobSkillsService({ jobId, payload }: { jobId: string; payload: JobSkillsForm, }) {
    const res = await adminApiClient.patch(`/jobs/${jobId}`, payload);

    return res.data
}
export async function deleteJobService({ jobId, tenantId }: { jobId: string; tenantId: string }) {
    const res = await adminApiClient.delete(`/tenants/${tenantId}/jobs/${jobId}`);

    return res.data
}
