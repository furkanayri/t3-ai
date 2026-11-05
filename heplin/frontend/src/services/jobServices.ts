import apiClient, { tenantApiClient } from 'src/libs/apiClient';
import type {
  JobDescriptionForm,
  JobForm,
  JobFormFields,
  JobGeneralInfoForm,
  JobStatusAction,
  JobApplicantQuestionForm,
  JobSkillsForm,
  UpdateJobApplicationEmployeePayload,
  JobTogglePublish,
  ArchiveJobForm,
} from 'src/types/jobPost';
interface JobApplicationUpdatePayload {
  seoTitle?: string;
  seoDescription?: string;
  endDate?: Date;
  applicantForm?: {
    description?: string;
    type: string;
    title: string;
    options: any[];
  }[];

  applicantId?: string;
  employeeId?: string;
}

export async function getAllJobsService(query?: string) {
  const res = await tenantApiClient.get(`/jobs?${query || ''}`);

  return res.data;
}
export async function getArchiveJobsService(query?: string) {
  const res = await tenantApiClient.get(`/archiveJob?${query || ''}`);

  return res.data;
}

export async function getJobDetailService({ id }: { id: string, }) {
  const res = await tenantApiClient.get(`/jobs/${id}`);

  return res?.data
}
export async function getArchiveJobDetailService({ id }: { id: string, }) {
  const res = await tenantApiClient.get(`/archivejobs/${id}`);

  return res?.data
}


export async function getJobDetailPublicService({ id }: { id: string }) {
  const res = await apiClient.get(`/v1/candidate/jobs/${id}`)

  return res.data
}

export async function getAllJobApplicationsService({ jobId, query }: { jobId?: string; query?: string }) {

  const res = await tenantApiClient.get(`/jobs/${jobId}/applicants?${query || ''}`)
  return res.data;
}
export async function getJobApplicationsExcelService({ jobId, query }: { jobId?: string; query?: string }) {

  const res = await tenantApiClient.get(`/jobs/${jobId}/applicants?${query || ''}`, { responseType: 'blob' })
  return res.data;
}
export async function getAllArchiveJobApplicationsService({ jobId, query }: { jobId?: string; query?: string }) {

  const res = await tenantApiClient.get(`/archiveJobs/${jobId}/applicants?${query || ''}`)
  return res.data;
}

export async function getHiringTeamsService({ id }: { id?: string }) {

  const res = await tenantApiClient.get(`/jobs/${id}/hiringTeams`)
  return res.data;
}

export async function getLatestJobApplicationsService() {
  const res = await tenantApiClient.get(`/applicants`)
  return res.data;
}


export async function getAllJobApplicationsOfCandidateService() {
  const res = await apiClient.get("/v1/candidate/my-applications")
  return res.data
}

export async function getJobApplicationsOfCandidateDetailService({ id }: { id: string }) {
  const res = await apiClient.get("/v1/candidate/my-applications/" + id)

  return res.data
}

export async function applyJobCandidateService({
  jobId,
  cv,
  applicantAnswers,
  coverLetter,
}: {
  jobId: string;
  cv: string;
  applicantAnswers: any[];
  coverLetter?: string;
}) {
  const res = await apiClient.post(`/v1/candidate/jobs/${jobId}/apply`, {
    cv,
    applicantAnswers,
    coverLetter,
  });

  return res.data
}

export async function postNewJobService(payload: JobForm) {
  const res = await tenantApiClient.post("/jobs", payload);

  return res.data
}
export async function postArchiveJobService(payload: ArchiveJobForm) {
  const res = await tenantApiClient.post("/archiveJob", payload);

  return res.data
}
export async function postAiContentJobMutation(payload: any) {
  const res = await tenantApiClient.post("/jobs/createAiContent", payload);

  return res.data
}

export async function updateJobService({ id, payload }: { id: string; payload: JobForm, }) {
  const res = await tenantApiClient.patch(`/jobs/${id}`, payload);

  return res.data
}
export async function updateJobApplicationService({ jobId, payload }: { jobId: string; payload: JobApplicationUpdatePayload }) {
  const response = await tenantApiClient.patch(`/jobs/${jobId}`, payload);
  return response.data;
}
export async function updateJobApplicationEmployeeService({ jobId, payload }: { jobId: string; payload: UpdateJobApplicationEmployeePayload }) {
  const response = await tenantApiClient.patch(`/jobs/${jobId}/update-employee`, payload);
  return response.data;
}

export async function updateGeneralInfoJobService({ id, payload }: { id: string; payload: JobGeneralInfoForm, }) {
  const res = await tenantApiClient.patch(`/jobs/${id}`, payload);

  return res.data
}

export async function updateFormFieldsJobService({ id, payload }: { id: string; payload: JobFormFields, }) {
  const res = await tenantApiClient.patch(`/jobs/${id}`, payload);

  return res.data
}

export async function updateJobDescriptionService({ id, payload }: { id: string; payload: JobDescriptionForm, }) {
  const res = await tenantApiClient.patch(`/jobs/${id}`, payload);

  return res.data
}

export async function updateJobApplicantQuestonsService({ id, payload }: { id: string; payload: JobApplicantQuestionForm, }) {
  const res = await tenantApiClient.patch(`/jobs/${id}`, payload);

  return res.data
}

export async function updateJobSkillsService({ id, payload }: { id: string; payload: JobSkillsForm, }) {
  const res = await tenantApiClient.patch(`/jobs/${id}`, payload);

  return res.data
}

export async function updateJobStatusService({ id, payload }: { id: string; payload: { status: JobStatusAction }, }) {
  const res = await tenantApiClient.patch(`/jobs/${id}`, payload);

  return res.data
}

export async function togglePublishService({ id, payload }: { id: string; payload: JobTogglePublish }) {
  const res = await tenantApiClient.post(`/jobs/${id}/tooglePublish`, payload);

  return res.data
}

export async function deleteJobService({ id }: { id: string, }) {
  const res = await tenantApiClient.delete(`/jobs/${id}`);

  return res.data
}

export async function deleteCandidateDrawJobApplicationService({ id }: { id: string }) {
  const res = await apiClient.delete("/v1/candidate/my-applications/" + id + "/draw")

  return res.data
}

export async function increaseJobViewService({ id }: { id: string, }) {
  const res = await apiClient.post("/v1/candidate/jobs/" + id + "/view")

  return res.data
}

export async function updateApplicant({ jobId, payload }: { jobId: string; payload: any }) {
  const res = await tenantApiClient.patch(`/applicants/${jobId}`, payload)
  return res.data
}
export async function updateApplicantReview({ jobId, id, payload }: { jobId: string; id: string; payload: any }) {
  const res = await tenantApiClient.patch(`/jobs/${jobId}/viewedBy/${id}`, payload)
  return res.data
}
export async function bulkCVUpload(payload: FormData) {
  // Axios genelde FormData geldiğinde kendi Content-Type'ını ayarlar ama yine de belirtmek yararlı
  const res = await tenantApiClient.post('/bulkCVUpload', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

