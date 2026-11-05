import { useMutation, useQuery } from '@tanstack/react-query';
import { getAllEmployeesService, postNewEmployeeService, deleteEmployeeService, updateEmployeeService, getOneEmployeeService, getMyEmployeeDataService } from 'src/services';
import { enabled } from 'store';

export function useGetAllEmployeesQuery(query: string) {
  return useQuery(['employees', query], () => getAllEmployeesService(query));
}

export function useGetMyEmployeeDataQuery() {
  return useQuery(["employees", "me"], () => getMyEmployeeDataService(),{enabled: true});
}

export function usePostNewEmployeeMutation() {
  return useMutation(postNewEmployeeService);
}
export function useDeleteEmployeeMutation() {
  return useMutation(deleteEmployeeService);
}

export function useUpdateEmployeeMutation() {
  return useMutation(updateEmployeeService)
}

export function useGetOneEmployeeQuery({ id }: { id: string }) {
  return useQuery(['employees', id], () => getOneEmployeeService({ id }), { enabled: !!id });
}