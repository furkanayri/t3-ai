import { useMutation, useQuery } from "@tanstack/react-query";
import { aiArchiveEvaluationCreateService, aiEvaluationCreateService, archiveGetAiEvaluation, autoFill, getAiEvaluation } from "src/services/aiEvaluationServices";

export function useAiEvaulationMutation() {
   return useMutation(aiEvaluationCreateService)
}

//ArchiveHeplinAi
export function useArchiveAiEvaulationMutation() {
   return useMutation(aiArchiveEvaluationCreateService)
}
// autoFill
export function useAutoFillMutation() {
   return useMutation(autoFill)
}
export function useGetAiEvaluationQuery(candidateId: string, jobId: string) {
   return useQuery(['heplinAi', candidateId], () => getAiEvaluation({ candidateId, jobId }), { enabled: !!candidateId });
}

//archiveGetAiEvaluationQuery
export function useGetArchiveAiEvaluationQuery(candidateId: string, jobId: string) {
   return useQuery(['archiveHeplinAi', candidateId], () => archiveGetAiEvaluation({ candidateId, jobId }), { enabled: !!candidateId });
}


