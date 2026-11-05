import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getAllPersonalityTestsService,
    getOnePersonalityTestService,
    postNewPersonalityTestService,
    updatePersonalityTestService,
    deletePersonalityTestService,
    togglePersonalityTestStatusService
} from 'src/services';

// Get all personality tests
export const useGetAllPersonalityTestsQuery = (payload?: string) => {
    return useQuery({
        queryKey: ['personalityTests', payload],
        queryFn: () => getAllPersonalityTestsService(payload),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get single personality test by ID
export const useGetOnePersonalityTestQuery = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['personalityTest', id],
        queryFn: () => getOnePersonalityTestService({ id }),
        enabled: !!id && enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Create new personality test
export const usePostNewPersonalityTestMutation = () => {
    return useMutation({
        mutationFn: postNewPersonalityTestService,
    });
};

// Update personality test
export const useUpdatePersonalityTestMutation = () => {
    return useMutation({
        mutationFn: updatePersonalityTestService,
    });
};

// Delete personality test
export const useDeletePersonalityTestMutation = () => {
    return useMutation({
        mutationFn: deletePersonalityTestService,
    });
};

// Toggle personality test status
export const useTogglePersonalityTestStatusMutation = () => {
    return useMutation({
        mutationFn: togglePersonalityTestStatusService,
    });
};