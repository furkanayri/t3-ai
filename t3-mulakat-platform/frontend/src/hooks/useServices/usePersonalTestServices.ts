import { useQuery, useMutation } from '@tanstack/react-query';
import {
    generateQuestionsService,
    evaluateAnswersService,
    getPersonalTestService,
} from 'src/services';

export function useGenerateQuestionsQuery() {
    return useQuery(['questions'], () => generateQuestionsService(), {
        keepPreviousData: true,
    });
}

export function useEvaluateAnswersMutation() {
    return useMutation(evaluateAnswersService);
}

export function usePersonalTestQuery({ candidateId }: { candidateId: string }) {
    return useQuery(['personaltest', candidateId], () => getPersonalTestService({ candidateId }),);
}
