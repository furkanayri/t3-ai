import { tenantApiClient } from 'src/libs/apiClient';
import { Employee } from 'src/types';

export async function getAllEmployeesService(query: string) {
  const res = await tenantApiClient.get(`/employees?${query}`)

  return res.data
}

export async function getMyEmployeeDataService() {
  const res = await tenantApiClient.get(`/profile/getMyEmployeeData`)

  return res.data;
}

export async function getOneEmployeeService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`/employees/${id}`);

  return res.data;
}

export async function updateEmployeeService({ id, payload }: { id: string; payload: any }) {
  const res = await tenantApiClient.patch(`/employees/${id}`, payload);

  return res.data;
}

export async function postNewEmployeeService(payload: Employee) {
  const res = await tenantApiClient.post("/employees", payload);

  return res.data
}
export async function deleteEmployeeService({ id }: { id: string, }) {
  const res = await tenantApiClient.delete(`/employees/${id}`);

  return res.data;
}