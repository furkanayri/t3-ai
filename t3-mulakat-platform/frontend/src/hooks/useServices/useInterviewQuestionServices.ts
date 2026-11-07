import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getAllInterviewQuestionsService,
    postNewInterviewQuestionService,
    deleteInterviewQuestionService,
    updateInterviewQuestionService,
    getOneInterviewQuestionService,
    toggleInterviewQuestionStatusService
} from 'src/services';

export function useGetAllInterviewQuestionsQuery(query?: string) {
    return useQuery(['interviewQuestions', query], () => getAllInterviewQuestionsService(query), {
        keepPreviousData: true
    });
}

export function usePostNewInterviewQuestionMutation() {
    return useMutation(postNewInterviewQuestionService);
}

export function useDeleteInterviewQuestionMutation() {
    return useMutation(deleteInterviewQuestionService);
}

export function useUpdateInterviewQuestionMutation() {
    return useMutation(updateInterviewQuestionService);
}

export function useGetOneInterviewQuestionQuery({ id }: { id: string }) {
    return useQuery(['interviewQuestions', id], () => getOneInterviewQuestionService({ id }), {
        enabled: !!id
    });
}

export function useToggleInterviewQuestionStatusMutation() {
    return useMutation(toggleInterviewQuestionStatusService);
}