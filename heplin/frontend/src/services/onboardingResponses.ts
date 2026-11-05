import { tenantApiClient } from 'src/libs/apiClient';

const basePath = '/onboardingresponses';

export async function getAllOnboardingResponsesService(query?: string) {
  const res = await tenantApiClient.get(`${basePath}?${query || ""}`);

  return res.data;
}

export async function getOnboardingResponseDetailService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`${basePath}/${id}`);
  return res.data
}

export async function postNewOnboardingResponseService(payload: any) {
  const res = await tenantApiClient.post(basePath, payload);

  return res.data;
}

export async function updateOnboardingResponseService({ id, payload }: { id: string; payload: any }) {
  const res = await tenantApiClient.patch(`${basePath}/${id}`, payload);

  return res.data;
}

export async function changeOnboardingResponseStatusService({ id, payload }: { id: string; payload: any }) {
  const res = await tenantApiClient.post(`${basePath}/${id}/change-status`, payload);

  return res.data;
}

export async function deleteOnboardingResponseService({ id }: { id: string }) {
  const res = await tenantApiClient.delete(`${basePath}/${id}`);

  return res.data;
}
