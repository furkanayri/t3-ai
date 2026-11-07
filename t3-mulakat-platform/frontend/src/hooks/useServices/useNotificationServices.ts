import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getAllNotificationService,
  updateNotificationService,
  deleteNotificationService
} from 'src/services';

export function useGetAllNotificationQuery() {
  return useQuery(['notification'], () => getAllNotificationService());
}

export function useUpdateNotificationMutation() {
  return useMutation(updateNotificationService);
}

export function useDeleteNotificationMutation() {
  return useMutation(deleteNotificationService);
} 