import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useCandidateInterviewUpdateMutation, useGetOneCandidateInterviewQuery } from 'src/hooks/useServices/useInterviewServices';
import { useNavigate } from "react-router";
import InterviewProvider, { useInterview } from '../InterviewContext/InterviewProvider';
import InterviewDetail from '../components/InterviewDetail';

function InterviewDetailRoute() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const { interviewId } = useParams()
    const { interview, updateInterview } = useInterview()
    const handleStartInterview = async () => {
        await updateInterview.mutateAsync({
            interviewId: interviewId ?? '',
            payload: {
                isStart: true,
                startDate: new Date(),
                status: 'started'
            }
        })
        navigate(`/interviews/${interviewId}/answer`)
    }
    return (
        <InterviewDetail
            interview={interview}
            handleStartInterview={handleStartInterview}
        />
    );
}

export function Component() {
    return (
        <InterviewProvider>
            <InterviewDetailRoute />
        </InterviewProvider>
    );
}

Component.displayName = "InterviewDetail";
