import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import React, { createContext, useContext, useEffect } from 'react'
import { ReactNode, } from 'react';
import { useParams } from 'react-router';
import { useCandidateAnswersUpdateMutation, useCandidateInterviewUpdateLogsMutation, useCandidateInterviewUpdateMutation, useGetAllCandidateInterviewQuery, useGetCandidateInterviewQuestion, useGetOneCandidateAnswerQuery, useGetOneCandidateInterviewQuery } from 'src/hooks/useServices/useInterviewServices';
import { array } from 'src/utils';
import InterviewDetail from '../components/InterviewDetail';
import { enqueueSnackbar } from 'notistack';

interface InterviewContextType {
    candidateInterviewQuery: any;
    candidateInterviews: any[];
    interview: any;
    interviewId: string;
    updateInterview: any;
    interviewQuestion: any;
    logsMutation: any
    isExpired: boolean;
    interviewAnswerMutation: any;
    candidateAnswers: any
    interviewQuery: any

}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const useInterview = () => {
    const context = useContext(InterviewContext);

    if (!context)
        throw new Error('useInterview hook must be used within <InterviewProvider> component');

    return context;
};


export default function InterviewProvider({ children, interviewId: interviewIdProp }: { children: ReactNode, interviewId?: string }) {
    const { interviewId: paramInterviewId } = useParams();
    const interviewId = interviewIdProp ?? paramInterviewId ?? '';

    const candidateInterviewQuery = useGetAllCandidateInterviewQuery()
    const candidateInterviews = array(candidateInterviewQuery?.data?.results)

    //burada candidateInterview
    const interviewQuery = useGetOneCandidateInterviewQuery({ interviewId: interviewId ?? '' });
    const interview = interviewQuery?.data;

    const interviewUpdateMutation = useCandidateInterviewUpdateMutation()

    const interviewQuestionQuery = useGetCandidateInterviewQuestion({ interviewId: interview?.interviewId ?? '' })
    const interviewQuestion = interviewQuestionQuery?.data

    const logsMutation = useCandidateInterviewUpdateLogsMutation()
    const interviewAnswerMutation = useCandidateAnswersUpdateMutation()

    const candidateAnswers = useGetOneCandidateAnswerQuery({ interviewAnswer: interview?.candidateAnswersId })

    const isExpired = new Date(interview?.expirationDate) < new Date()


    // useEffect(() => {
    //     if (interview?.startDate) {
    //         const totalDurationInSeconds = interview.totalDuration * 60;
    //         const currentTime = new Date();
    //         const startDate = new Date(interview.startDate);
    //         const timeDifference = (currentTime.getTime() - startDate.getTime()) / 1000;

    //         if (timeDifference >= totalDurationInSeconds) {
    //             interviewUpdateMutation.mutateAsync({
    //                 interviewId: interview?._id ?? '',
    //                 payload: { accessLocked: true, status: 'expired' }
    //             }, {
    //                 onSuccess: () => {
    //                     interviewQuery.refetch()
    //                 },
    //                 onError: () => {
    //                     enqueueSnackbar('Bir sorun ile karşılaştım.', { variant: 'error' });
    //                 },
    //             });
    //         }
    //     }
    // }, [])



    if (interview && (interview.accessLocked || isExpired)) {

        return <InterviewDetail
            isExpired={true}
            interview={interview}
        />;
    }

    return (
        <InterviewContext.Provider
            value={{
                candidateInterviewQuery,
                candidateInterviews,
                interview,
                interviewId,
                interviewQuery,
                updateInterview: interviewUpdateMutation,
                interviewQuestion,
                logsMutation,
                isExpired,
                interviewAnswerMutation,
                candidateAnswers
            }}
        >
            {children}
        </InterviewContext.Provider>
    )
}

