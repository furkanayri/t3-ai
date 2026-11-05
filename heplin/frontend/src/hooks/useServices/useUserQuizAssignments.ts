import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createQuizAssignmentService,
    getAllQuizAssignmentsService,
    getUserQuizAssignmentsService,
    getQuizAssignmentDetailService,
    startQuizAssignmentService,
    updateQuizAssignmentService,
    deleteQuizAssignmentService,
    getCandidateQuizAssignmentsService,
    startCandidateQuizAssignmentService,
    CreateQuizAssignmentPayload,
    UpdateQuizAssignmentPayload,
} from 'src/services/UserQuizAssignments';

// Query Hooks

// Tüm atamaları listele (Admin)
export function useGetAllQuizAssignmentsQuery(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
}) {
    return useQuery(
        ['quiz-assignments', params],
        () => getAllQuizAssignmentsService(params),
        {
            keepPreviousData: true,
            refetchOnWindowFocus: false,
        }
    );
}

// Kullanıcının atamaları
export function useGetUserQuizAssignmentsQuery(
    userId: string,
    params?: {
        page?: number;
        limit?: number;
        status?: string;
    }
) {
    return useQuery(
        ['quiz-assignments', 'user', userId, params],
        () => getUserQuizAssignmentsService(userId, params),
        {
            enabled: !!userId,
            keepPreviousData: true,
            refetchOnWindowFocus: false,
        }
    );
}

// Atama detayı
export function useGetQuizAssignmentDetailQuery(assignmentId: string) {
    return useQuery(
        ['quiz-assignments', assignmentId],
        () => getQuizAssignmentDetailService(assignmentId),
        {
            enabled: !!assignmentId,
            refetchOnWindowFocus: false,
        }
    );
}

// Mutation Hooks

// Kullanıcıya quiz ata
export function useCreateQuizAssignmentMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        (payload: CreateQuizAssignmentPayload) => createQuizAssignmentService(payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['quiz-assignments']);
            },
        }
    );
}

// Quiz başlat
export function useStartQuizAssignmentMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        (assignmentId: string) => startQuizAssignmentService(assignmentId),
        {
            onSuccess: (data, assignmentId) => {
                queryClient.invalidateQueries(['quiz-assignments', assignmentId]);
                queryClient.invalidateQueries(['quiz-assignments']);
            },
        }
    );
}

// Atama güncelle
export function useUpdateQuizAssignmentMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        ({ assignmentId, payload }: { assignmentId: string; payload: UpdateQuizAssignmentPayload }) =>
            updateQuizAssignmentService(assignmentId, payload),
        {
            onSuccess: (data, { assignmentId }) => {
                queryClient.invalidateQueries(['quiz-assignments', assignmentId]);
                queryClient.invalidateQueries(['quiz-assignments']);
            },
        }
    );
}

// Atama sil
export function useDeleteQuizAssignmentMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        (assignmentId: string) => deleteQuizAssignmentService(assignmentId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['quiz-assignments']);
            },
        }
    );
}

// ============ ACCOUNTS APP (Candidate) Hooks ============

// Candidate'ın kendi atamaları
export function useGetCandidateQuizAssignmentsQuery(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    return useQuery(
        ['candidate-quiz-assignments', params],
        () => getCandidateQuizAssignmentsService(params),
        {
            keepPreviousData: true,
            refetchOnWindowFocus: false,
        }
    );
}

// Candidate quiz başlat
export function useStartCandidateQuizAssignmentMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        (assignmentId: string) => startCandidateQuizAssignmentService(assignmentId),
        {
            onSuccess: (data, assignmentId) => {
                queryClient.invalidateQueries(['candidate-quiz-assignments']);
            },
        }
    );
}
