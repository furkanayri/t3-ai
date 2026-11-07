import { useMutation, useQuery } from '@tanstack/react-query';
import { getAllTeamsService, postNewTeamService, deleteTeamService, updateTeamService, getOneTeamService, getTeamsOfDepartmentService } from 'src/services';

export function useGetAllTeamsQuery() {
  return useQuery(['teams'], () => getAllTeamsService());
}

export function usePostNewTeamMutation() {
  return useMutation(postNewTeamService);
}
export function useDeleteTeamMutation() {
  return useMutation(deleteTeamService);
}

export function useUpdateTeamMutation() {
  return useMutation(updateTeamService)
}

export function useGetOneTeamQuery({ id }: { id: string }) {
  return useQuery(['teams', id], () => getOneTeamService({ id }), { enabled: !!id });
}

export function useGetTeamsOfDepartment({ departmentId }: { departmentId: string }) {
  return useQuery(['teams', "department", departmentId], () => getTeamsOfDepartmentService({ departmentId }), { enabled: !!departmentId });
}