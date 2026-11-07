import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllQuestions,
    createQuestion,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsByCategory,
    getRandomQuestions,
    getQuestionStatistics,
    toggleQuestionStatus,
    bulkImportFromExcel,
    downloadExcelTemplate,
    validateExcelFile,
    deleteMultipleQuestions,
    toggleMultipleQuestions,
    duplicateQuestion,
    QuizQuestion,
    QuizQuestionListParams
} from 'src/services/quiz';

// Query Hooks

export function useGetAllQuestionsQuery(params?: QuizQuestionListParams) {
    return useQuery(
        ['quiz-questions', params],
        () => getAllQuestions(params),
        {
            keepPreviousData: true,
            refetchOnWindowFocus: false
        }
    );
}

export function useGetQuestionQuery(questionId: string) {
    return useQuery(
        ['quiz-questions', questionId],
        () => getQuestion(questionId),
        {
            enabled: !!questionId,
            refetchOnWindowFocus: false
        }
    );
}

export function useGetQuestionsByCategoryQuery(categoryId: string, params?: Omit<QuizQuestionListParams, 'category'>) {
    return useQuery(
        ['quiz-questions', 'category', categoryId, params],
        () => getQuestionsByCategory(categoryId, params),
        {
            enabled: !!categoryId,
            keepPreviousData: true,
            refetchOnWindowFocus: false
        }
    );
}

export function useGetRandomQuestionsQuery(params?: {
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    categoryId?: string;
    excludeIds?: string[];
}) {
    return useQuery(
        ['quiz-questions', 'random', params],
        () => getRandomQuestions(params),
        {
            refetchOnWindowFocus: false,
            enabled: false // Manuel olarak tetiklenecek
        }
    );
}

export function useGetQuestionStatisticsQuery() {
    return useQuery(
        ['quiz-questions', 'statistics'],
        () => getQuestionStatistics(),
        {
            refetchOnWindowFocus: false
        }
    );
}

// Mutation Hooks

export function useCreateQuestionMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionData: Omit<QuizQuestion, '_id' | 'createdAt' | 'updatedAt'>) =>
            createQuestion(questionData),
        onSuccess: () => {
            queryClient.invalidateQueries(['quiz-questions']);
            queryClient.invalidateQueries(['quiz-questions', 'statistics']);
        },
    });
}

export function useUpdateQuestionMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId, questionData }: {
            questionId: string;
            questionData: Partial<QuizQuestion>
        }) => updateQuestion(questionId, questionData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['quiz-questions']);
            queryClient.invalidateQueries(['quiz-questions', variables.questionId]);
            queryClient.invalidateQueries(['quiz-questions', 'statistics']);
        },
    });
}

export function useDeleteQuestionMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId: string) => deleteQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['quiz-questions']);
            queryClient.invalidateQueries(['quiz-questions', 'statistics']);
        },
    });
}

export function useToggleQuestionStatusMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId, isActive }: { questionId: string; isActive: boolean }) =>
            toggleQuestionStatus(questionId, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries(['quiz-questions']);
        }
    });
}

export function useBulkImportFromExcelMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => bulkImportFromExcel(file),

    });
}

export function useValidateExcelFileMutation() {
    return useMutation({
        mutationFn: (file: File) => validateExcelFile(file),
    });
}

export function useDeleteMultipleQuestionsMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionIds: string[]) => deleteMultipleQuestions(questionIds),
        onSuccess: () => {
            queryClient.invalidateQueries(['quiz-questions']);
            queryClient.invalidateQueries(['quiz-questions', 'statistics']);
        },
    });
}

export function useToggleMultipleQuestionsMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionIds, isActive }: { questionIds: string[]; isActive: boolean }) =>
            toggleMultipleQuestions(questionIds, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries(['quiz-questions']);
            queryClient.invalidateQueries(['quiz-questions', 'statistics']);
        },
    });
}

export function useDuplicateQuestionMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId: string) => duplicateQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['quiz-questions']);
            queryClient.invalidateQueries(['quiz-questions', 'statistics']);
        },
    });
}

// Utility Hook for Excel Template Download
export function useDownloadExcelTemplate() {
    return useMutation({
        mutationFn: () => downloadExcelTemplate(),
        onSuccess: (data) => {
            // Blob'u dosya olarak indir
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'quiz-questions-template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
    });
}