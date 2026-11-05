import { useMutation, useQuery } from "@tanstack/react-query";
import { createCandidateInterviewInvitationService, videoInterviewEvaluation, updateInterviewQuestionService, createInterviewQuestionWithJobService, createInterviewQuestionWithTextService, createInterviewService, deleteInterviewService, getAllCandidateInterview, getAllInterviewQuestionsService, getAllInterviewService, getInterviewQuestion, getOneCandidateAnswer, getOneCandidateInterview, getTenantInterviewList, updateCandidateAnswer, updateCandidateInterview, updateCandidateInterviewLogs, updateCandidateVideoAnswer, updateInterviewQuestionToVoice, textInterviewEvaluation, retrieveCandidateInterview, getTenantInverviewAnswer, generatePresignedUrlService, getInterviewAnswersByTypeService, getBatchVideoEvaluationService } from "src/services/interviewServices";

export function useGetAiInterviewQuery() {
    return useQuery(['interview'], () => getAllInterviewService());
}

export function useCreateInterviewMutation() {
    return useMutation(createInterviewService);
}
export function useVideoInterviewEvaluation() {
    return useMutation(videoInterviewEvaluation)
}
export function useTextInterviewEvaluation() {
    return useMutation(textInterviewEvaluation)
}

export function useDeleteInterviewMutation() {
    return useMutation(deleteInterviewService);
}

export function useUpdateInterviewQuestionMutation() {
    return useMutation(updateInterviewQuestionService);
}
export function useCreateInterviewQuestionWithJobMutation() {
    return useMutation(createInterviewQuestionWithJobService);
}
export function useCreateInterviewQuestionWithTextMutation() {
    return useMutation(createInterviewQuestionWithTextService);
}
export function useInterviewQuestionToVoiceMutation() {
    return useMutation(updateInterviewQuestionToVoice);
}
export function useCandidateInterviewInvitationMutation() {
    return useMutation(createCandidateInterviewInvitationService);
}

export function useGetAiInterviewQuestionsQuery({ interviewId }: { interviewId: string }) {
    return useQuery(['interview-questions', interviewId], () => getAllInterviewQuestionsService({ interviewId }), {
        enabled: !!interviewId,
    });
}
export function useGetAllCandidateInterviewQuery() {
    return useQuery(['interviews-candidate',], () => getAllCandidateInterview());
}
export function useGetCandidateInterviewQuestion({ interviewId }: { interviewId: string }) {
    return useQuery(['interviews-question-candidate', , interviewId], () => getInterviewQuestion({ interviewId })
        , {
            enabled: !!interviewId,
        });
}
export function useGetOneCandidateInterviewQuery({ interviewId }: { interviewId: string }) {
    return useQuery(['interview-one-candidate', interviewId], () => getOneCandidateInterview({ interviewId })
        , {
            enabled: !!interviewId,
        });
}

export function useCandidateInterviewUpdateMutation() {
    return useMutation(updateCandidateInterview);
}
export function useCandidateInterviewUpdateLogsMutation() {
    return useMutation(updateCandidateInterviewLogs);
}
export function useCandidateAnswersUpdateMutation() {
    return useMutation(updateCandidateAnswer);
}
export function useCandidateVideoAnswersUpdateMutation() {
    return useMutation(updateCandidateVideoAnswer);
}

export function useGetOneCandidateAnswerQuery({ interviewAnswer }: { interviewAnswer: string }) {
    return useQuery(['interview-one-candidate-answer', interviewAnswer], () => getOneCandidateAnswer({ interviewAnswer })
        , {
            enabled: !!interviewAnswer,
        });
}
export function useGetInterviewList({ jobId, jobApplicationId, interviewType, query }: { jobId: string, jobApplicationId: string, interviewType: string, query: string }) {

    return useQuery(['interview-tenant-list', jobId, jobApplicationId, query], () => getTenantInterviewList({ jobId, jobApplicationId, interviewType, query })
        , {
            enabled: !!jobId && !!jobApplicationId && !!interviewType && !!query,
            cacheTime: 0,
            staleTime: 0,
        });
}

export function useGetTenantInterviewAnswerQuery({ candidateAnswersId }: { candidateAnswersId: string }) {
    return useQuery(
        ['tenant-interview-answer', candidateAnswersId],
        () => getTenantInverviewAnswer({ candidateAnswersId }),
        {
            enabled: !!candidateAnswersId,
            cacheTime: 0,
            staleTime: 0,
        }
    );
}

export function useGetCandidateRetrieveJobQuery({ jobId, jobApplicantId }: { jobId: string, jobApplicantId: string }) {
    return useQuery(
        ['candidate-interview-by-job', jobId, jobApplicantId],
        () => retrieveCandidateInterview({ jobId, jobApplicantId }),
        {
            enabled: !!jobId && !!jobApplicantId,
        }
    );
}

export function useGeneratePresignedUrlMutation() {
    return useMutation(generatePresignedUrlService);
}

export function useGetInterviewAnswersByTypeQuery(params: {
    interviewType: string,
    candidateId?: string,
    page?: number,
    limit?: number
}) {
    return useQuery(
        ['interview-answers-by-type', params.interviewType, params.candidateId, params.page, params.limit],
        () => getInterviewAnswersByTypeService(params),
        {
            enabled: !!params.interviewType && !!params.candidateId,
            cacheTime: 0,
            staleTime: 0,
        }
    );
}

export function useGetBatchVideoEvaluationQuery(candidateAnswerId: string) {
    return useQuery(
        ['batch-video-evaluation', candidateAnswerId],
        () => getBatchVideoEvaluationService({ candidateAnswerId }),
        {
            enabled: !!candidateAnswerId,
            cacheTime: 0,
            staleTime: 0,
            refetchOnWindowFocus: true,
        }
    );
}
