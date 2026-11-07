import { tenantApiClient } from 'src/libs/apiClient';
import { RecruitmentStageStep, RecruitmentStageStepPayload } from 'src/types';

const basePath = '/recruitment-stages';

export async function getAllRecruitmentStageStepsService(recruitmentStageId?: string) {
  const res = await tenantApiClient.get(`${basePath}/${recruitmentStageId}/steps`);

  return res.data
}

export async function getRecruitmentStageStepDetailService(query: { id: string, recruitmentStageId: string }) {
  const res = await tenantApiClient.get(`${basePath}/${query?.recruitmentStageId}/steps/${query.id}`);

  return res.data
}

export async function postNewRecruitmentStageStepService(data: { recruitmentStageId: string, payload: RecruitmentStageStepPayload }) {
  const res = await tenantApiClient.post(`${basePath}/${data.recruitmentStageId}/steps`, data.payload);

  return res.data;
}

export async function updateRecruitmentStageStepService(data: {
  id: string;
  recruitmentStageId: string;
  payload: RecruitmentStageStep;
}) {
  const res = await tenantApiClient.patch(`${basePath}/${data.recruitmentStageId}/steps/${data.id}`, data.payload);

  return res.data;
}

export async function deleteRecruitmentStageStepService(data: { id: string, recruitmentStageId: string; }) {
  const res = await tenantApiClient.delete(`${basePath}/${data.recruitmentStageId}/steps/${data.id}`);

  return res.data;
}
