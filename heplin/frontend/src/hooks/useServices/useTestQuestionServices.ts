import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getAllTestQuestionsService,
    addTestQuestionService,
    removeTestQuestionService
} from 'src/services';

// Get all test questions
export const useGetAllTestQuestionsQuery = (payload?: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['testQuestions', payload],
        queryFn: () => getAllTestQuestionsService(payload),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: options?.enabled !== false && !!payload, // Only run if enabled is not false and payload exists
    });
};

// Add question to test
export const useAddTestQuestionMutation = () => {
    return useMutation({
        mutationFn: addTestQuestionService,
    });
};

// Remove question from test
export const useRemoveTestQuestionMutation = () => {
    return useMutation({
        mutationFn: removeTestQuestionService,
    });
};