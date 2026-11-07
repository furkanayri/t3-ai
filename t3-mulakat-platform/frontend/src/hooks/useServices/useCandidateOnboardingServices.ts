import { useMutation, useQuery } from '@tanstack/react-query';
import { createCandidateOnboardingService, getOneCandidateOnboardingService, getMyCandidateOnboardingDetailService, updateMyCandidateOnboardingService } from 'src/services/candidateOnboardingServices';

// export function useGetAllCandidateOnboardingsQuery() {
//   return useQuery(['candidateOnboarding'], () => getAllCandidateOnboardingsService());
// }

export function useCreateCandidateOnboardingMutation() {
  return useMutation(createCandidateOnboardingService);
}
// export function useDeleteCandidateOnboardingMutation() {
//   return useMutation(deleteCandidateOnboardingService);
// }

// export function useUpdateCandidateOnboardingMutation() {
//   return useMutation(updateDepartmentService)
// }

export function useGetOneCandidateOnboardingQuery({ id }: { id: string }) {
  return useQuery(['onboarding-detail', id], () => getOneCandidateOnboardingService({ id }), { enabled: !!id });
}
export function useGetMyOnboardingDetailQuery({ id }: { id: string }) {
  return useQuery(['onboarding-detail-candidate', id], () => getMyCandidateOnboardingDetailService({ id }), { enabled: !!id });
}
export function useUpdateMyOnboardingMutation() {
  return useMutation(updateMyCandidateOnboardingService);
}