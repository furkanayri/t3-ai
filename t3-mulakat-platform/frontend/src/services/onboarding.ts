import { tenantApiClient } from 'src/libs/apiClient';
import { OnboardingWorkflow } from 'src/types';

const basePath = '/onboardingworkflows';

export async function getAllOnboardingWorkflowsService(query?: string) {
  const res = await tenantApiClient.get(`${basePath}?${query || ""}`);

  return res.data;
}

export async function getOnboardingWorkflowDetailService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`${basePath}/${id}`);
  return res.data
}

export async function postNewOnboardingWorkflowService(payload: any) {
  const res = await tenantApiClient.post(basePath, payload);

  return res.data;
}

export async function updateOnboardingWorkflowService({ id, payload }: { id: string; payload: OnboardingWorkflow; }) {
  const res = await tenantApiClient.patch(`${basePath}/${id}`, payload);

  return res.data;
}

export async function assignOnboardingWorkflowService({ id, payload }: { id: string; payload: any; }) {
  const res = await tenantApiClient.post(`${basePath}/${id}/assign`, payload);

  return res.data;
}

export async function deleteOnboardingWorkflowService({ id }: { id: string }) {
  const res = await tenantApiClient.delete(`${basePath}/${id}`);

  return res.data;
}
