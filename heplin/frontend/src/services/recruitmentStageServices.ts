import { tenantApiClient } from 'src/libs/apiClient';
import { RecruitmentStage, RecruitmentStagePayload } from 'src/types';

const basePath = '/recruitment-stages';

export async function getAllRecruitmentStagesService(query?: string) {
  const res = await tenantApiClient.get(`${basePath}?${query || ""}`);

  return res.data;
}

export async function getRecruitmentStageDetailService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`${basePath}/${id}`);
  return res.data
}

export async function postNewRecruitmentStageService(payload: RecruitmentStagePayload) {
  const res = await tenantApiClient.post(basePath, payload);

  return res.data;
}

export async function updateRecruitmentStageService({ id, payload }: { id: string; payload: RecruitmentStage; }) {
  const res = await tenantApiClient.patch(`${basePath}/${id}`, payload);

  return res.data;
}

export async function deleteRecruitmentStageService({ id }: { id: string }) {
  const res = await tenantApiClient.delete(`${basePath}/${id}`);

  return res.data;
}
