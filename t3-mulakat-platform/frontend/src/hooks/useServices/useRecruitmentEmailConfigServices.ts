import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getAllRecruitmentEmailConfigsService,
    getRecruitmentEmailConfigDetailService,
    updateRecruitmentEmailConfigService,
} from 'src/services';

export function useGetAllRecruitmentEmailConfigsQuery(stageId: string) {
    return useQuery(['recruitmentEmailConfigs'], () => getAllRecruitmentEmailConfigsService(stageId), { enabled: !!stageId });
}

export function useGetRecruitmentEmailConfigDetailsQuery(stepId: string) {
    return useQuery(['recruitmentEmailConfigs', stepId], () => getRecruitmentEmailConfigDetailService(stepId), {
        enabled: !!stepId,
    });
}

// export function usePostNewRecruitmentEmailConfigMutation() {
//     return useMutation(postNewRecruitmentStageService);
// }

export function useUpdateRecruitmentEmailConfigMutation() {
    return useMutation(updateRecruitmentEmailConfigService);
}

// export function useDeleteRecruitmentEmailConfigMutation() {
//     return useMutation(deleteRecruitmentStageService);
// }
