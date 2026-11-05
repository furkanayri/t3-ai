import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getQuizSessionService,
    submitAnswerService,
    completeQuizService,
    getSessionResultsService,
    getCandidateQuizSessionService,
    submitCandidateAnswerService,
    completeCandidateQuizService,
    getCandidateSessionResultsService,
    SubmitAnswerPayload,
    CompleteQuizPayload,
} from 'src/services/quizSessions';

// Query Hooks

// Session detayı getir
export function useGetQuizSessionQuery(sessionId: string, options?: { enabled?: boolean }) {
    return useQuery(
        ['quiz-sessions', sessionId],
        () => getQuizSessionService(sessionId),
        {
            enabled: !!sessionId && (options?.enabled !== false),
            refetchOnWindowFocus: false,
            staleTime: 30000, // 30 saniye
        }
    );
}

// Session sonuçlarını getir
export function useGetSessionResultsQuery(sessionId: string, options?: { enabled?: boolean }) {
    return useQuery(
        ['quiz-sessions', sessionId, 'results'],
        () => getSessionResultsService(sessionId),
        {
            enabled: !!sessionId && (options?.enabled !== false),
            refetchOnWindowFocus: false,
        }
    );
}

// Mutation Hooks

// Cevap gönder
export function useSubmitAnswerMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        ({ sessionId, payload }: { sessionId: string; payload: SubmitAnswerPayload }) =>
            submitAnswerService(sessionId, payload),
        {
            onSuccess: (data, { sessionId }) => {
                // Session cache'ini güncelle
                queryClient.invalidateQueries(['quiz-sessions', sessionId]);
            },
        }
    );
}

// Quiz tamamla
export function useCompleteQuizMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        ({ sessionId, payload }: { sessionId: string; payload?: CompleteQuizPayload }) =>
            completeQuizService(sessionId, payload),
        {
            onSuccess: (data, { sessionId }) => {
                // Session ve assignment cache'lerini güncelle
                queryClient.invalidateQueries(['quiz-sessions', sessionId]);
                queryClient.invalidateQueries(['quiz-assignments']);
            },
        }
    );
}

// ============ ACCOUNTS APP (Candidate) Hooks ============

// Candidate session detayı getir
export function useGetCandidateQuizSessionQuery(sessionId: string, options?: { enabled?: boolean }) {
    return useQuery(
        ['candidate-quiz-sessions', sessionId],
        () => getCandidateQuizSessionService(sessionId),
        {
            enabled: !!sessionId && (options?.enabled !== false),
            refetchOnWindowFocus: false,
            staleTime: 30000, // 30 saniye
        }
    );
}

// Candidate session sonuçlarını getir
export function useGetCandidateSessionResultsQuery(sessionId: string, options?: { enabled?: boolean }) {
    return useQuery(
        ['candidate-quiz-sessions', sessionId, 'results'],
        () => getCandidateSessionResultsService(sessionId),
        {
            enabled: !!sessionId && (options?.enabled !== false),
            refetchOnWindowFocus: false,
        }
    );
}

// Candidate cevap gönder
export function useSubmitCandidateAnswerMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        ({ sessionId, payload }: { sessionId: string; payload: SubmitAnswerPayload }) =>
            submitCandidateAnswerService(sessionId, payload),
        {
            onSuccess: (data, { sessionId }) => {
                // Session cache'ini güncelle
                queryClient.invalidateQueries(['candidate-quiz-sessions', sessionId]);
            },
        }
    );
}

// Candidate quiz tamamla
export function useCompleteCandidateQuizMutation() {
    const queryClient = useQueryClient();

    return useMutation(
        ({ sessionId, payload }: { sessionId: string; payload?: CompleteQuizPayload }) =>
            completeCandidateQuizService(sessionId, payload),
        {
            onSuccess: (data, { sessionId }) => {
                // Session ve assignment cache'lerini güncelle
                queryClient.invalidateQueries(['candidate-quiz-sessions', sessionId]);
                queryClient.invalidateQueries(['candidate-quiz-assignments']);
            },
        }
    );
}
