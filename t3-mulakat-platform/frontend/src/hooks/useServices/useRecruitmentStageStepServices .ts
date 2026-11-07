import { useQuery, useMutation } from '@tanstack/react-query';
import {
  deleteRecruitmentStageStepService,
  getAllRecruitmentStageStepsService,
  getRecruitmentStageStepDetailService,
  postNewRecruitmentStageStepService,
  updateRecruitmentStageStepService,
} from 'src/services';

export function useGetAllRecruitmentStageStepsQuery(recruitmentStageId?: string) {
  return useQuery(['recruitmentStageSteps', recruitmentStageId], () => getAllRecruitmentStageStepsService(recruitmentStageId), {
    enabled: !!recruitmentStageId,
  });
}

export function useGetRecruitmentStageStepDetailQuery(payload: { id: string, recruitmentStageId: string; }) {
  return useQuery(['recruitmentStageStep-details', payload], () => getRecruitmentStageStepDetailService(payload), {
    enabled: !!payload?.id,
  });
}

export function usePostNewRecruitmentStageStepMutation() {
  return useMutation(postNewRecruitmentStageStepService);
}

export function useUpdateRecruitmentStageStepMutation() {
  return useMutation(updateRecruitmentStageStepService);
}

export function useDeleteRecruitmentStageStepMutation() {
  return useMutation(deleteRecruitmentStageStepService);
}
