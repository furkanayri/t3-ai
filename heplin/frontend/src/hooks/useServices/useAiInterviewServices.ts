import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createInterviewInvitation,
    getAiInterviewAnswersByJobId,
    getAiInterviewAnswersGetAll,
    getAiInterviewsByJobId,
    getAllMyInterviewsAnswersService,
    getInterviewAnswersDetailService,
    getInterviewChatService,
    updateAiInterviewService,
    updateInterviewAnswersService,
    updateInterviewChatService,
    updateInterviewevaluateService
} from "src/services/aiInterviewServices";

export function useAiInterviewAnswersQuery() {
    return useQuery(['aiInterviews-answers'], getAllMyInterviewsAnswersService)
}

export function useAiInterviewsAnswersDetailQuery({ id }: { id: string }) {
    return useQuery(['aiInterviews-answers-details', id], () => getInterviewAnswersDetailService({ id }), { refetchOnWindowFocus: true, })
}
export function useAiInterviewAnswersMutation() {
    return useMutation(updateInterviewAnswersService)
}
// chat
export function useAiInterviewsChatQuery({ id }: { id: string }) {
    return useQuery(['aiInterviews-chat', id], () => getInterviewChatService({ id }), { refetchOnWindowFocus: true, })
}
export function useAiInterviewChatMutation() {
    return useMutation(updateInterviewChatService)
}


//  evaluate
export function useAiInterviewEvaluateMutation() {
    return useMutation(updateInterviewevaluateService)
}



//tenant

export function useAiInterviewsQuery(id: string) {
    return useQuery(['aiInterviews', id], () => getAiInterviewsByJobId({ jobId: id }))
}
export function useAiInterviewsAnswersQuery(interviewAnswerId: string, applicantId: string) {
    return useQuery(['aiInterviews-company', interviewAnswerId, applicantId], () => getAiInterviewAnswersByJobId({ interviewAnswerId: interviewAnswerId, applicantId: applicantId }), { enabled: !!applicantId })
}
export function useAiInterviewsAnswersGetAllQuery(interviewAnswerId: string, applicantId: string) {
    return useQuery(['aiInterviews-company-getAll', interviewAnswerId, applicantId], () => getAiInterviewAnswersGetAll({ interviewAnswerId: interviewAnswerId, applicantId: applicantId }), { enabled: !!applicantId })
}
export function useUpdateAiInterviewMutation() {
    return useMutation(updateAiInterviewService)
}

export function useCreateInterviewInvitation() {
    return useMutation(createInterviewInvitation)
}