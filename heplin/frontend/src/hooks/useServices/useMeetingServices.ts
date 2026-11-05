import { useQuery, useMutation } from '@tanstack/react-query';
import {
  deleteMeetingService,
  getAllMeetingsService,
  getMeetingDetailService,
  getMyMeetings,
  postMeetingSignatureService,
  postNewMeetingService,
  updateMeetingService,
} from 'src/services';

export function useGetAllMeetingsQuery(query: any) {
  return useQuery(['meetings', query], () => getAllMeetingsService(query), { keepPreviousData: true });
}

export function useLatestUpcomingMeetingsQuery() {
  return useQuery(['meetings', 'upcoming', 'latest'], () =>
    getAllMeetingsService({
      status: 'initial',
      $limit: 10,
    })
  );
}

export function useGetMeetingDetailQuery(id: string) {
  return useQuery(['meetings', id], () => getMeetingDetailService({ id }));
}

export function usePostNewMeetingMutation() {
  return useMutation(postNewMeetingService);
}

export function useUpdateMeetingMutation() {
  return useMutation(updateMeetingService);
}

export function useDeleteMeetingMutation() {
  return useMutation(deleteMeetingService);
}

export function useGetMyMeetings() {
  return useQuery(['meetings'], () => getMyMeetings());
}

export function usePostMeetingSignatureMutation() {
  return useMutation(({ meetingNumber, role }: { meetingNumber: number; role: number }) =>
    postMeetingSignatureService(meetingNumber, role)
  );
}