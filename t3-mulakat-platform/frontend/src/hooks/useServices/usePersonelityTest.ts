import { useQuery, useMutation } from '@tanstack/react-query';
import {
    startPersonalityTest,
    submitAnswer,
    getCurrentQuestion,
    checkEligibility,
} from 'src/services/personalityTestServices';

// Kişilik testi başlatma hook'u
export function useStartPersonalityTest() {
    return useMutation({
        mutationFn: startPersonalityTest,
    });
}

// Cevap gönderme hook'u
export function useSubmitAnswer(sessionId: string) {
    return useMutation({
        mutationFn: (payload: any) => submitAnswer(sessionId, payload),
    });
}

// Mevcut soruyu getirme hook'u
export function useGetCurrentQuestion(sessionId: string) {
    return useQuery({
        queryKey: ['personality-test', 'current-question', sessionId],
        queryFn: () => getCurrentQuestion(sessionId),
        enabled: !!sessionId,
    });
}

// Uygunluk kontrolü hook'u
export function useCheckEligibility() {
    return useQuery({
        queryKey: ['personality-test', 'check-eligibility'],
        queryFn: () => checkEligibility(),
    });
}