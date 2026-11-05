import { useQuery, useMutation } from '@tanstack/react-query';
import {
    assignOnboardingWorkflowService,
    deleteOnboardingWorkflowService,
    getAllOnboardingWorkflowsService,
    getOnboardingWorkflowDetailService,
    postNewOnboardingWorkflowService,
    updateOnboardingWorkflowService,
} from 'src/services';

export function useGetAllOnboardingWorkflowsQuery(query?: string) {
    return useQuery(['onboardingWorkflows', query], () => getAllOnboardingWorkflowsService(query), { keepPreviousData: true });
}

export function useGetOnboardingWorkflowDetailQuery({ id }: { id: string }) {
    return useQuery(['onboardingWorkflows', id], () => getOnboardingWorkflowDetailService({ id }), {
        enabled: !!id,
    });
}

export function usePostNewOnboardingWorkflowMutation() {
    return useMutation(postNewOnboardingWorkflowService);
}

export function useUpdateOnboardingWorkflowMutation() {
    return useMutation(updateOnboardingWorkflowService);
}

export function useDeleteOnboardingWorkflowMutation() {
    return useMutation(deleteOnboardingWorkflowService);
}

export function useAssignOnboardingWorkflowMutation() {
    return useMutation(assignOnboardingWorkflowService);
}
