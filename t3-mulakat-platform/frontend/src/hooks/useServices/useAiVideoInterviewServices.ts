import { useMutation, useQuery } from "@tanstack/react-query"
import { getVideoInterview, getVideoInterviewAnswers, getVideoInterviewQuestion, getVideoPresignedUrl, interviewEvaluationResults, saveInterviewVideo, updateStatusInterviewVideo, updateVideoInterview, videoInterviewInvitation, videoInterviewResult } from "src/services/videoInterviewServices"

export function useAiVideoInterview(jobId: string) {
    return useQuery(['aiInterviewVideo', jobId], () => getVideoInterview({ jobId }), { enabled: !!jobId })
}
export function useAiVideoInterviewResult(jobId: string, candidateId: string) {
    return useQuery(['aiInterview-result', candidateId], () => videoInterviewResult({ jobId, candidateId }), { enabled: !!candidateId })
}
export function useVideoInterviewQuestion() {
    return useMutation(updateVideoInterview)
}

// export function useVideoInterviewEvaluation() {
//     return useMutation(videoInterviewEvaluation)
// }

export function useVideoInterviewEvaluationQuery(candidateInterviewId: string) {
    return useQuery(['interviewEvaluationResults', candidateInterviewId], () => interviewEvaluationResults({ candidateInterviewId }), { enabled: !!candidateInterviewId })

}


export function useCreateVideoInterviewInvitation() {
    return useMutation(videoInterviewInvitation)
}

// candidate 

export function useAiVidoeInterviewAnswersQuery() {
    return useQuery(['aiInterviewAnswers-video'], getVideoInterviewAnswers)
}
export function useUpdateStatusInterviewVideo() {
    return useMutation(updateStatusInterviewVideo)
}

// question
export function useAiVideoInterviewQuestionQuery(interviewId: string) {
    return useQuery(['aiInterviewQuestion-video', interviewId], () => getVideoInterviewQuestion({ interviewId }), { enabled: !!interviewId })
}

// save video
export function useSaveInterviewVideo() {
    return useMutation(saveInterviewVideo)
}

export function useVideoPresignedUrl(fileKey: string) {
    return useQuery(
        ['videoPresignedUrl', fileKey],
        () => getVideoPresignedUrl({ fileKey }),
        {
            enabled: !!fileKey,
            staleTime: 10 * 60 * 1000,
            cacheTime: 15 * 60 * 1000,
            retry: false,
        }
    )
}
