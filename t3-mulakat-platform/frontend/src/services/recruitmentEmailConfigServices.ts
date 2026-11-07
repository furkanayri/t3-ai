import { tenantApiClient } from 'src/libs/apiClient';
import { RecruitmentEmailConfigPayload, RecruitmentEmailConfig } from 'src/types';

const basePath = '/recruitment-email-configs';

export async function getAllRecruitmentEmailConfigsService(stageId?: string) {
  const res = await tenantApiClient.get(`${basePath}?stageId=${stageId}`);

  return res.data
}

export async function getRecruitmentEmailConfigDetailService(stepId?: string) {
  const res = await tenantApiClient.get(`${basePath}/${stepId}`);

  return res.data
}

// export async function postNewRecruitmentEmailConfigService(data: { recruitmentStageId: string, payload: RecruitmentEmailConfigPayload }) {
//   const res = await tenantApiClient.post(`${basePath}/${data.recruitmentStageId}/steps`, data.payload);

//   return res.data;
// }

export async function updateRecruitmentEmailConfigService({ id, payload }: { id: string; payload: RecruitmentEmailConfigPayload; }) {
  const res = await tenantApiClient.patch(`${basePath}/${id}`, payload);

  return res.data;
}

// export async function deleteRecruitmentEmailConfigService(data: { id: string, recruitmentStageId: string; }) {
//   const res = await tenantApiClient.delete(`${basePath}/${data.recruitmentStageId}/steps/${data.id}`);

//   return res.data;
// }
