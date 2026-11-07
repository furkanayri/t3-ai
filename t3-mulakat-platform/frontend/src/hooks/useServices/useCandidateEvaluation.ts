import { useMutation, useQuery } from "@tanstack/react-query";
import { ca } from "date-fns/locale";
import { createCandidateEvaluation, getCandidateEvaluations } from "src/services/evaluationsCandidatesServices";

export function useCreateCandidateEvaluation() {
    return useMutation(createCandidateEvaluation);
}
export function useGetCandidateEvaluation(candidateId: string, query: string) {
    return useQuery(['candidate-evaluation', candidateId, query],
        () => getCandidateEvaluations({ candidateId, query }),
        { enabled: !!candidateId });
}