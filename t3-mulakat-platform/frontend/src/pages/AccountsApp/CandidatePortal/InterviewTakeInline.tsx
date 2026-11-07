import { Box, CircularProgress } from '@mui/material';
import { useState } from 'react';
import InterviewProvider, { useInterview } from '../Interviews/InterviewContext/InterviewProvider';
import InterviewDetail from '../Interviews/components/InterviewDetail';
import TextInterview from '../Answer/section/TextInterview';
import VideoInterview from '../Answer/section/VideoInterview';

type Step = 'detail' | 'answer';

function InterviewTakeInner({ onExit }: { onExit: () => void }) {
    const { interview, interviewId, updateInterview } = useInterview();
    const [step, setStep] = useState<Step>('detail');

    if (!interview) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleStartInterview = async () => {
        await updateInterview.mutateAsync({
            interviewId: interviewId ?? '',
            payload: {
                isStart: true,
                startDate: new Date(),
                status: 'started',
            },
        });
        setStep('answer');
    };

    if (step === 'answer') {
        if (interview?.interviewType === 'video') {
            return <VideoInterview onFinish={onExit} />;
        }
        return <TextInterview onFinish={onExit} />;
    }

    return (
        <InterviewDetail
            interview={interview}
            handleStartInterview={handleStartInterview}
        />
    );
}

export default function InterviewTakeInline({ interviewId, onExit }: { interviewId: string, onExit: () => void }) {
    return (
        <InterviewProvider interviewId={interviewId}>
            <InterviewTakeInner onExit={onExit} />
        </InterviewProvider>
    );
}
