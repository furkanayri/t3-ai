import { useMutation, useQuery } from '@tanstack/react-query';
import { getAllDepartmentsService, postNewDepartmentService, deleteDepartmentService, updateDepartmentService, getOneDepartmentService } from 'src/services';

export function useGetAllDepartmentsQuery(query: any) {
  return useQuery(['departments', query], () => getAllDepartmentsService(query), { keepPreviousData: true });
}

export function usePostNewDepartmentMutation() {
  return useMutation(postNewDepartmentService);
}
export function useDeleteDepartmentMutation() {
  return useMutation(deleteDepartmentService);
}

export function useUpdateDepartmentMutation() {
  return useMutation(updateDepartmentService)
}

export function useGetOneDepartmentQuery({ id }: { id: string }) {
  return useQuery(['departments', id], () => getOneDepartmentService({ id }), { enabled: !!id });
}