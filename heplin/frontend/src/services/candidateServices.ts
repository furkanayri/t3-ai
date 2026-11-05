import { apiClient } from 'src/libs';
import { tenantApiClient } from 'src/libs/apiClient';
import { Certificate } from 'src/types/Certificate';
import { Education, Experience, Skill } from 'src/types';
import { Language } from 'src/types/Language';

export async function getAllCandidatesService(query?: string) {
  const res = await tenantApiClient.get(`/candidates?${query || ''}`);
  return res.data;
}
export async function getAllCandidatesExcelService(query?: string) {
  const res = await tenantApiClient.get(`/candidates?${query || ''}`, {
    responseType: 'blob',
  });
  return res.data;
}
export async function getAllCandidatesFilterService({ limit, query }: { limit?: number; query?: string }) {
  let queryParams = [];
  if (limit) {
    queryParams.push(`limit=${limit}`);
  }
  if (query) {
    queryParams.push(`query=${encodeURIComponent(query)}`);
  }
  const queryString = queryParams.join('&');
  const res = await tenantApiClient.get(`/candidates?${queryString}`)
  return res.data;
}

export async function getCandidateDetailService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`/candidates/${id}`);

  return res.data;
}
export async function getArchiveCandidateDetailService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`/archiveCandidates/${id}`);

  return res.data;
}

//Candidate Experience Services
export async function getAllCandidateExperiencesService() {
  const res = await apiClient.get(`/v1/candidate/experiences`);

  return res.data;
}

export async function getCandidateExperienceDetailService({ id }: { id: string }) {
  const res = await apiClient.get(`/v1/candidate/experiences/${id}`);

  return res.data;
}

export async function postNewCandidateExperienceService(payload: Experience) {
  const res = await apiClient.post(`/v1/candidate/experiences`, payload);

  return res.data;
}

export async function updateCandidateExperienceService({
  id,
  payload,
}: {
  id: string;
  payload: Experience;
}) {
  const res = await apiClient.patch(`/v1/candidate/experiences/${id}`, payload);

  return res.data;
}

export async function deleteCandidateExperienceService({ id }: { id: string }) {
  const res = await apiClient.delete(`/v1/candidate/experiences/${id}`);

  return res.data;
}

//Candidate Language Services
export async function getAllCandidateLanguagesService() {
  const res = await apiClient.get(`/v1/candidate/languages`)

  return res.data;
}

export async function getCandidateLanguageDetailService({ id }: { id: string }) {
  const res = await apiClient.get(`/v1/candidate/languages/${id}`)

  return res.data
}

//Candidate Language Services


export async function postNewCandidateLanguageService(payload: Language) {
  const res = await apiClient.post(`/v1/candidate/languages`, payload);

  return res.data
}


//Candidate Skill Services
export async function getAllCandidateSkillsService() {
  const res = await apiClient.get(`/v1/candidate/skills`)

  return res.data;
}

export async function getCandidateSkillDetailService({ id }: { id: string }) {
  const res = await apiClient.get(`/v1/candidate/skills/${id}`)

  return res.data
}

export async function postNewCandidateSkillService(payload: any) {
  const res = await apiClient.post(`/v1/candidate/skills`, payload);

  return res.data
}

export async function updateCandidateSkillService({
  id,
  payload,
}: {
  id: string;
  payload: any;
}) {
  const res = await apiClient.patch(`/v1/candidate/skills/${id}`, payload);

  return res.data
}

export async function deleteCandidateSkillService({ id }: { id: string }) {
  const res = await apiClient.delete(`/v1/candidate/skills/${id}`);

  return res.data
}






export async function updateCandidateLanguageService({
  id,
  payload,
}: {
  id: string;
  payload: Language;
}) {
  const res = await apiClient.patch(`/v1/candidate/languages/${id}`, payload);

  return res.data
}

export async function deleteCandidateLanguageService({ id }: { id: string }) {
  const res = await apiClient.delete(`/v1/candidate/languages/${id}`);

  return res.data
}
//Candidate Education Services
export async function getAllCandidateEducationsService() {
  const res = await apiClient.get(`/v1/candidate/educations`);

  return res.data;
}
//all educations by tenant
export async function getAllEducationsOfTenantService() {
  const res = await tenantApiClient.get(`/educations`);

  return res.data;
}

export async function getCandidateEducationDetailService({ id }: { id: string }) {
  const res = await apiClient.get(`/v1/candidate/educations/${id}`);

  return res.data;
}

export async function postNewCandidateEducationService(payload: Education) {
  const res = await apiClient.post(`/v1/candidate/educations`, payload);

  return res.data;
}

export async function updateCandidateEducationService({
  id,
  payload,
}: {
  id: string;
  payload: Education;
}) {
  const res = await apiClient.patch(`/v1/candidate/educations/${id}`, payload);

  return res.data;
}

export async function deleteCandidateEducationService({ id }: { id: string }) {
  const res = await apiClient.delete(`/v1/candidate/educations/${id}`);

  return res.data;
}

//Candidate Certificate Service
export async function getAllCandidateCertificatesService() {
  const res = await apiClient.get(`/v1/candidate/certificates`);

  return res.data;
}

export async function getCandidateCertificateDetailService({ id }: { id: string }) {
  const res = await apiClient.get(`/v1/candidate/certificates/${id}`);

  return res.data;
}

export async function postNewCandidateCertificateService(payload: Certificate) {
  const res = await apiClient.post(`/v1/candidate/certificates`, payload);

  return res.data;
}

export async function updateCandidateCertificateService({
  id,
  payload,
}: {
  id: string;
  payload: Certificate;
}) {
  const res = await apiClient.patch(`/v1/candidate/certificates/${id}`, payload);

  return res.data;
}

export async function deleteCandidateCertificateService({ id }: { id: string }) {
  const res = await apiClient.delete(`/v1/candidate/certificates/${id}`);

  return res.data;
}

//Stage Update Services
export async function candidateStageUpdateService({
  jobId,
  applicantId,
  currentRecruitmentStepId,
}: {
  jobId: string;
  applicantId: string;
  currentRecruitmentStepId: string;
}) {
  const res = await tenantApiClient.post(`/jobs/${jobId}/applicants/${applicantId}/move`, {
    currentRecruitmentStepId,
  });

  return res.data;
}

export async function disqualifyJobApplicationService({ jobId, payload }: {
  jobId: string,
  payload: {
    applicationId: string;
    candidateId: string;
    disqualifyReason: string;
  }
}) {
  const res = await tenantApiClient.post(`/jobs/${jobId}/application/disqualify`, {
    ...payload
  });

  return res.data;
}

export async function candidateBlackListsService({ jobId, payload }: {
  jobId: string,
  payload: {
    applicationId: string;
    candidateId: string;
    reason: string;
  }
}) {
  const res = await tenantApiClient.post(`/jobs/${jobId}/application/candidateBlackList`, {
    ...payload
  });

  return res.data;
}

export async function removeCandidateBlackListsService(payload: {
  candidateId: string;
  tenantId: string;
}) {
  const res = await tenantApiClient.post(`/candidateBlackList`, payload);

  return res.data;
}

export async function bulkDisqualifyJobApplicationsService({
  jobId,
  payload,
}: {
  jobId: string;
  payload: {
    stepId: string;
    disqualifyReason: string;
  };
}) {
  const res = await tenantApiClient.post(
    `/jobs/${jobId}/applications/disqualify/bulk`,
    {
      ...payload,
    }
  );

  return res.data;
}
