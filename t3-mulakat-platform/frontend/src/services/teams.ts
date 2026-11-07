import { tenantApiClient } from 'src/libs/apiClient';
import { Team } from 'src/types';

export async function getAllTeamsService() {
  const res = await tenantApiClient.get('/teams')

  return res.data
}

export async function getOneTeamService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`/teams/${id}`);

  return res.data;
}

export async function getTeamsOfDepartmentService({ departmentId }: { departmentId: string }) {
  const res = await tenantApiClient.get(`/teamsOfDepartment/${departmentId}`);
  return res.data;
}

export async function updateTeamService({ id, payload }: { id: string; payload: any }) {
  const res = await tenantApiClient.patch(`/teams/${id}`, payload);

  return res.data;
}

export async function postNewTeamService(payload: Team) {
  const res = await tenantApiClient.post("/teams", payload);

  return res.data
}
export async function deleteTeamService({ id }: { id: string, }) {
  const res = await tenantApiClient.delete(`/teams/${id}`);

  return res.data;
}