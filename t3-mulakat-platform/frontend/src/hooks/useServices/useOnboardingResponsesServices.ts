import { useQuery, useMutation } from '@tanstack/react-query';
import {
    changeOnboardingResponseStatusService,
    deleteOnboardingResponseService,
    getAllOnboardingResponsesService,
    getOnboardingResponseDetailService,
    postNewOnboardingResponseService,
    updateOnboardingResponseService,
} from 'src/services';

export function useGetAllOnboardingResponsesQuery(query?: string) {
    return useQuery(['onboardingResponses', query], () => getAllOnboardingResponsesService(query));
}

export function useGetOnboardingResponseDetailQuery({ id }: { id: string }) {
    return useQuery(['onboardingResponses', id], () => getOnboardingResponseDetailService({ id }), {
        enabled: !!id,
    });
}

export function usePostNewOnboardingResponseMutation() {
    return useMutation(postNewOnboardingResponseService);
}

export function useUpdateOnboardingResponseMutation() {
    return useMutation(updateOnboardingResponseService);
}

export function useChangeOnboardingResponseStatusMutation() {
    return useMutation(changeOnboardingResponseStatusService)
}

export function useDeleteOnboardingResponseMutation() {
    return useMutation(deleteOnboardingResponseService);
}
