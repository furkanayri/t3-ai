import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getAllDimensionsService,
    postNewDimensionService,
    deleteDimensionService,
    updateDimensionService,
    getOneDimensionService,
    toggleDimensionStatusService
} from 'src/services';

export function useGetAllDimensionsQuery(query?: string) {
    return useQuery(['dimensions', query], () => getAllDimensionsService(query), {
        keepPreviousData: true
    });
}

export function usePostNewDimensionMutation() {
    return useMutation(postNewDimensionService);
}

export function useDeleteDimensionMutation() {
    return useMutation(deleteDimensionService);
}

export function useUpdateDimensionMutation() {
    return useMutation(updateDimensionService);
}

export function useGetOneDimensionQuery({ id }: { id: string }) {
    return useQuery(['dimensions', id], () => getOneDimensionService({ id }), {
        enabled: !!id
    });
}

export function useToggleDimensionStatusMutation() {
    return useMutation(toggleDimensionStatusService);
}