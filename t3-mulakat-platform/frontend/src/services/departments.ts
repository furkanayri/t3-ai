import { tenantApiClient } from 'src/libs/apiClient';
import { Department } from 'src/types';

export async function getAllDepartmentsService(payload: any) {
  const res = await tenantApiClient.get(`/departments?${payload ?? ""}`)

  return res.data
}

export async function getOneDepartmentService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`/departments/${id}`);

  return res.data;
}

export async function updateDepartmentService({ id, payload }: { id: string; payload: any }) {
  const res = await tenantApiClient.patch(`/departments/${id}`, payload);

  return res.data;
}

export async function postNewDepartmentService(payload: Department) {
  const res = await tenantApiClient.post("/departments", payload);

  return res.data
}
export async function deleteDepartmentService({ id }: { id: string, }) {
  const res = await tenantApiClient.delete(`/departments/${id}`);

  return res.data;
}