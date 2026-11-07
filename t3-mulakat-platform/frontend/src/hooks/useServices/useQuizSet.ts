import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getAllQuizSetsService,
    createQuizSetService,
    getQuizSetDetailService,
    updateQuizSetService,
    deleteQuizSetService,
    toggleQuizSetService
} from 'src/services';

// GET /api/v1/tenants/:tenantId/quiz-sets - Tüm quiz setleri listeleme
export function useGetAllQuizSetsQuery(query?: string) {
    return useQuery(['quiz-sets', query], () => getAllQuizSetsService(query), {
        keepPreviousData: true
    });
}

// GET /api/v1/tenants/:tenantId/quiz-sets/:quizSetId - Quiz set detayı
export function useGetQuizSetDetailQuery({ quizSetId }: { quizSetId: string }) {
    return useQuery(['quiz-sets', quizSetId], () => getQuizSetDetailService({ quizSetId }), {
        enabled: !!quizSetId
    });
}

// POST /api/v1/tenants/:tenantId/quiz-sets - Yeni quiz set oluşturma
export function useCreateQuizSetMutation() {
    return useMutation(createQuizSetService);
}

// PUT /api/v1/tenants/:tenantId/quiz-sets/:quizSetId - Quiz set güncelleme
export function useUpdateQuizSetMutation() {
    return useMutation(updateQuizSetService);
}

// DELETE /api/v1/tenants/:tenantId/quiz-sets/:quizSetId - Quiz set silme
export function useDeleteQuizSetMutation() {
    return useMutation(deleteQuizSetService);
}

// PATCH /api/v1/tenants/:tenantId/quiz-sets/:quizSetId/toggle - Aktif/pasif yapma
export function useToggleQuizSetMutation() {
    return useMutation(toggleQuizSetService);
}
