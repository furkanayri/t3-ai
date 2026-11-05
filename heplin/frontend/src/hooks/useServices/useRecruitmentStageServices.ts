import { useQuery, useMutation } from '@tanstack/react-query';
import {
    deleteRecruitmentStageService,
    getAllRecruitmentStagesService,
    getRecruitmentStageDetailService,
    postNewRecruitmentStageService,
    updateRecruitmentStageService,
} from 'src/services';

export function useGetAllRecruitmentStagesQuery(query?: string) {
    return useQuery(['recruitmentStages', query], () => getAllRecruitmentStagesService(query), { keepPreviousData: true });
}

export function useGetRecruitmentStageDetailQuery(id: string) {
    return useQuery(['recruitmentStages', id], () => getRecruitmentStageDetailService({ id }), {
        enabled: !!id,
    });
}

export function usePostNewRecruitmentStageMutation() {
    return useMutation(postNewRecruitmentStageService);
}

export function useUpdateRecruitmentStageMutation() {
    return useMutation(updateRecruitmentStageService);
}

export function useDeleteRecruitmentStageMutation() {
    return useMutation(deleteRecruitmentStageService);
}
